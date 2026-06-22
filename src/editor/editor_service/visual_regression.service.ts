import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JSDOM } from 'jsdom';
import { Model } from 'mongoose';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';
import { VisualEvaluationDto } from '../dtos/visual_regression.dto';
import { CloudinaryService } from '../editor_service/cloudinary.service';
import { PuppeteerEvaluator } from '../evaluators/visual-regression/puppeteer_run.evaluator';

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
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}

  async getTargetPreview(exerciseId: string): Promise<string | null> {
    if (!this.puppeteerEvaluator) {
      console.warn(
        '[VisualRegression] Puppeteer not available - skipping target preview',
      );
      return null;
    }

    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .lean();
    const targetDesign = exercise?.target_design;
    const codeTest = exercise?.code_test;

    if (!targetDesign || !codeTest) return null;

    try {
      const browser = this.puppeteerEvaluator.getBrowser();
      let page: any = null;

      try {
        if (!this.targetImageCache.has(exerciseId)) {
          page = await browser.newPage();
          await page.setViewport({
            width: targetDesign.width,
            height: targetDesign.height,
          });

          const isReady = await this.renderPage(
            page,
            codeTest.html,
            codeTest.css,
            codeTest.js,
            codeTest.jsx,
          );
          if (!isReady) return null;

          this.targetImageCache.set(
            exerciseId,
            <Buffer>await page.screenshot({ type: 'png' }),
          );
        }

        const screenshot = this.targetImageCache.get(exerciseId);
        if (!screenshot) return null;

        return `data:image/png;base64,${screenshot.toString('base64')}`;
      } catch (error: any) {
        console.error('[Target Preview Error]', error.message);
        return null;
      } finally {
        if (page && !page.isClosed()) await page.close();
      }
    } catch {
      console.warn(
        '[VisualRegression] Browser not available - skipping target preview',
      );
      return null;
    }
  }

  async evaluateVisual(
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

    // Nếu Puppeteer không khả dụng, trả về mảng rỗng (không làm lỗi)
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
        const isPassed = matchPercentage >= 99.99;

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
      // 1. Gắn HTML và CSS cơ bản
      const dom = new JSDOM(html || '<div id="root"></div>');
      const doc = dom.window.document;
      if (!doc.getElementById('root')) {
        const rootDiv = doc.createElement('div');
        rootDiv.id = 'root';
        doc.body.appendChild(rootDiv);
      }

      const baseHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${doc.body.innerHTML}</body></html>`;
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
        await page.evaluate(() => console.log('Puppeteer running...'));
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
