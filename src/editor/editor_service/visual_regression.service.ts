import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JSDOM } from 'jsdom';
import { Model } from 'mongoose';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { ActivityType } from '../../users/schemas/activity-log.schema';
import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';
import { VisualEvaluationDto } from '../dtos/visual_regression.dto';
import { CloudinaryService } from '../editor_service/cloudinary.service';
import { PuppeteerEvaluator } from '../evaluators/visual-regression/puppeteer_run.evaluator';
import { GamificationService } from '@/users/services/gamification.service';

declare const Babel: {
  transform: (
    code: string,
    options: Record<string, unknown>,
  ) => { code: string };
};

@Injectable()
export class VisualRegressionService {
  private targetImageCache = new Map<string, Buffer>(); // lưu screenshot của các bài tập
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly puppeteerEvaluator: PuppeteerEvaluator,
    private readonly gamification: GamificationService,
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}
  async uploadTargetUrls(): Promise<string> {
    const exercises = await this.exerciseModel.find({
      code_test: { $ne: null },
    }); // lấy bài tập
    if (!this.puppeteerEvaluator) {
      return '[Target Image] Puppeteer is not initialized!';
    }
    const browser = this.puppeteerEvaluator.getBrowser();
    for (const exercise of exercises) {
      if (!exercise.code_test) continue;
      let page: any = null;

      try {
        page = await browser.newPage();
        await page.setViewport({
          width: exercise.target_design.width,
          height: exercise.target_design.height,
        });

        const { html, css, js, jsx } = exercise.code_test;
        const isReady = await this.renderPage(page, html, css, js, jsx);

        if (!isReady) {
          console.error(
            `[Target Image] Failed to render UI for ${exercise.id}`,
          );
          continue;
        }
        const screenshotBuffer = await page.screenshot({ type: 'png' }); // screenshot đưa về Buffer
        const folderName = 'frontendly_codeTestImages';
        const uploadResult = await this.cloudinaryService.uploadImageBuffer(
          screenshotBuffer,
          folderName,
        );

        await this.exerciseModel.updateOne(
          { id: exercise.id },
          { $set: { target_url: uploadResult.secure_url } },
        );
        console.log(
          `[Target Image] Success ${exercise.id} -> ${uploadResult.secure_url}`,
        );
      } catch (error: any) {
        console.error(`[Target Image] Error on ${exercise.id}:`, error.message);
      } finally {
        if (page && !page.isClosed()) await page.close();
      }
    }
    const resultMsg = `[Target Image] Done!`;
    console.log(resultMsg);
    return resultMsg;
  }

  async evaluateVisual(
    userId: string,
    exerciseId: string,
    html: string,
    css: string,
    js: string,
    jsx: string,
  ): Promise<VisualEvaluationDto[]> {
    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .lean();
    const targetDesign = exercise?.target_design;
    if (!targetDesign) return [];

    // ko có puppeteer
    if (!this.puppeteerEvaluator) {
      console.warn(
        '[VisualRegression] Puppeteer not available - skipping visual evaluation',
      );
      return [];
    }

    if (!html?.trim() && !css?.trim() && !js?.trim() && !jsx?.trim()) {
      return [
        {
          deviceType: targetDesign.deviceType,
          passed: false,
          matchPercentage: 0,
          diffImageUrl: null,
        },
      ];
    }

    try {
      const browser = this.puppeteerEvaluator.getBrowser();
      const codeTest = exercise?.code_test;
      let targetPage: any = null;
      let userPage: any = null;

      try {
        if (!codeTest) throw new Error('Cannot define the code testing!');

        // codetest screenshot nếu chưa có trong cache
        if (!this.targetImageCache.has(exerciseId)) {
          targetPage = await browser.newPage();
          await targetPage.setViewport({
            width: targetDesign.width,
            height: targetDesign.height,
          });

          const isTargetReady = await this.renderPage(
            targetPage,
            codeTest.html,
            codeTest.css,
            codeTest.js,
            codeTest.jsx,
          );
          if (!isTargetReady)
            throw new Error(`Target render timeout when render ${exerciseId}.`);

          this.targetImageCache.set(
            exerciseId,
            <Buffer>await targetPage.screenshot({ type: 'png' }),
          );

          // tránh tràn RAM nên xóa screenshot cũ nhất trong cache
          const MAX_CACHE_SIZE = 50;
          if (this.targetImageCache.size > MAX_CACHE_SIZE) {
            const oldestExerciseId = <any>(
              this.targetImageCache.keys().next().value
            ); // xóa phần screenshot cũ nhất
            this.targetImageCache.delete(oldestExerciseId);
            console.log(
              `[Visual Service] Cache clear the exercise ${oldestExerciseId}`,
            );
          }
          await targetPage.close();
        }

        // user screenshot
        userPage = await browser.newPage();
        userPage.on('pageerror', (err: any) =>
          console.log('[Puppeteer User Error]', err.message),
        );
        await userPage.setViewport({
          width: targetDesign.width,
          height: targetDesign.height,
        });

        const isUserReady = await this.renderPage(userPage, html, css, js, jsx);
        if (!isUserReady) {
          console.log(
            `[Visual Service] User code failed to render. Failing automatically.`,
          );
          return [
            {
              deviceType: targetDesign.deviceType,
              passed: false,
              matchPercentage: 0,
              diffImageUrl: null,
            },
          ];
        }

        const userScreenshot = await userPage.screenshot({ type: 'png' });
        const targetScreenshot = this.targetImageCache.get(exerciseId);

        if (!targetScreenshot)
          throw new Error(`[Visual Service] Target image cache missing`);

        // compare pixel
        const userImg = PNG.sync.read(Buffer.from(userScreenshot)); // Buffer -> Object
        const targetImg = PNG.sync.read(targetScreenshot); // Buffer -> Object
        const { width, height } = targetImg;
        const diff = new PNG({ width, height });

        const mismatchedPixels = pixelmatch(
          userImg.data,
          targetImg.data,
          diff.data,
          width,
          height,
          { threshold: 0.05, includeAA: true },
        );

        const totalPixels = width * height;
        const matchPercentage =
          ((totalPixels - mismatchedPixels) / totalPixels) * 100;
        const isPassed = matchPercentage >= 95;
        if (matchPercentage === 100)
          void this.gamification.addXp(
            userId,
            ActivityType.PERFECT_VISUAL,
            exerciseId,
          );

        let diffImageUrl = null;
        if (!isPassed) {
          const diffBuffer = PNG.sync.write(diff);
          try {
            const folderName = 'frontendly_diffImages';
            const uploadDiffImage =
              await this.cloudinaryService.uploadImageBuffer(
                diffBuffer,
                folderName,
              );
            diffImageUrl = uploadDiffImage.secure_url;
          } catch (error: any) {
            console.error(
              `[Visual Service] Cannot upload the image on Cloudinary:`,
              error.message,
            );
          }
        }

        return [
          {
            deviceType: targetDesign.deviceType,
            passed: isPassed,
            matchPercentage: parseFloat(matchPercentage.toFixed(2)),
            diffImageUrl: diffImageUrl,
          },
        ];
      } catch (error: any) {
        console.error('[Visual Evaluation Error]', error.message);
        return []; // Trả về mảng rỗng thay vì throw lỗi
      } finally {
        if (targetPage && !targetPage.isClosed()) await targetPage.close();
        if (userPage && !userPage.isClosed()) await userPage.close();
      }
    } catch {
      console.warn(
        '[VisualRegression] Browser not available - skipping visual evaluation',
      );
      return [];
    }
  }

  // gom code
  private async renderPage(
    page: any,
    html: string,
    css: string,
    js: string,
    jsx: string,
  ): Promise<boolean> {
    try {
      const dom = new JSDOM(html || '<div id="root"></div>');
      const doc = dom.window.document;
      if (!doc.getElementById('root')) {
        const rootDiv = doc.createElement('div');
        rootDiv.id = 'root';
        doc.body.appendChild(rootDiv);
      }

      const baseHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${doc.body.innerHTML}</body></html>`;
      page.on('pageerror', (error: any) =>
        console.error('[Puppeteer Page Error]', error.message),
      );
      page.on('console', (msg: any) =>
        console.log('[Puppeteer Console]', msg.text()),
      );
      await page.setContent(baseHtml, { waitUntil: 'load' });

      // 2. Chích React và Babel (An toàn hơn dùng script type="text/babel")
      if (jsx?.trim()) {
        await Promise.all([
          page.addScriptTag({
            url: 'https://unpkg.com/react@18/umd/react.development.js',
          }),
          page.addScriptTag({
            url: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
          }),
          page.addScriptTag({
            url: 'https://unpkg.com/@babel/standalone/babel.min.js',
          }),
        ]);

        const { cleanJsx, componentName } = this.processJsx(jsx);

        await page.evaluate(
          (jsxStr: string, compName: string | null) => {
            const win = <any>window;
            if (win.React) {
              Object.keys(win.React).forEach(key => {
                win[key] = win.React[key];
              });
            }

            if (win.ReactDOM) {
              win.createRoot = win.ReactDOM.createRoot;
              Object.keys(win.ReactDOM).forEach(key => {
                if (!win[key]) win[key] = win.ReactDOM[key];
              });
            }

            win.styles = new Proxy(
              {},
              {
                get: function (prop) {
                  return prop;
                },
              },
            );

            const transpiledCode = Babel.transform(jsxStr, {
              presets: [['react', { runtime: 'classic' }]],
            }).code;
            const script = document.createElement('script');
            script.innerHTML = transpiledCode;
            document.body.appendChild(script);

            if (compName) {
              const mountScript = document.createElement('script');
              mountScript.innerHTML = `
              const rootEl = document.getElementById('root');
              if (rootEl) ReactDOM.createRoot(rootEl).render(React.createElement(${compName}));
            `;
              document.body.appendChild(mountScript);
            }
          },
          cleanJsx,
          componentName,
        );

        // Chờ component xuất hiện
        await page.evaluate(() =>
          console.log('[Visual Service] Puppeteer running...'),
        );
        await page.waitForSelector('#root > *', { timeout: 5000 });
      } else if (js?.trim()) {
        await page.addScriptTag({ content: js });
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      return true;
    } catch (error: any) {
      console.error('[Render Page Error]', error.message);
      return false;
    }
  }

  // hàm clean lại jsx
  private processJsx(jsx: string): {
    cleanJsx: string;
    componentName: string | null;
  } {
    if (!jsx) return { cleanJsx: '', componentName: null };

    const cleanJsx = jsx
      .replace(/import[^'"]+['"][^'"]+['"];?/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '');

    const match = jsx.match(
      /export\s+default\s+(?:function\s+|class\s+)?(\w+)/,
    );

    return {
      cleanJsx,
      componentName: match ? match[1] : null,
    };
  }
}
