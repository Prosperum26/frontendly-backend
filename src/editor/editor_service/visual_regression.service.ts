import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JSDOM } from 'jsdom';
import { Model } from 'mongoose';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';
import { VisualEvaluationDto } from '../dtos/visual_regression.dto';
import { PuppeteerEvaluator } from '../evaluators/visual-regression/puppeteer_run.evaluator';

@Injectable()
export class VisualRegressionService {
  // Lưu các hình ảnh của code mẫu vào cache để sau này chỉ cần lấy ra xài
  private targetImage = new Map<string, Buffer>();
  constructor(
    private readonly puppeteerEvaluator: PuppeteerEvaluator,
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}
  async evaluateVisual(
    exerciseId: string, // Thêm để lấy làm key cache
    html: string,
    css: string,
    js: string,
  ): Promise<VisualEvaluationDto[]> {
    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .lean();
    const codeTest = exercise?.code_test;
    const targetDesign = exercise?.target_design;

    if (!targetDesign) {
      return [];
    }

    const browser = this.puppeteerEvaluator.getBrowser(); // Mở 1 cái trên server chạy ngầm
    const page = await browser.newPage(); // Tab mới
    try {
      if (!html?.trim() && !css?.trim() && !js?.trim()) {
        return [
          {
            deviceType: targetDesign.deviceType,
            passed: false,
            matchPercentage: 0,
            diffImageUrl: null,
          },
        ];
      }
      if (!codeTest) {
        throw new Error('Cannot define the code testing!');
      }

      // xài cái này để khi có user submit code lần đầu thì sẽ lưu vào trong cache bài đó luôn
      // sau này các user khác submit thì chỉ cần lấy từ cache ra là được
      if (!this.targetImage.has(exerciseId)) {
        const CODE_TEST = this.renderHtml(
          codeTest.html,
          codeTest.css,
          codeTest.js,
        );
        await page.setContent(CODE_TEST, { waitUntil: 'load' });
        await page.setViewport({
          width: targetDesign.width,
          height: targetDesign.height,
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // load trang

        const targetBuffer = <Buffer>await page.screenshot({ type: 'png' }); // screenshot -> buffer
        this.targetImage.set(exerciseId, targetBuffer); // lưu vào cache trình duyệt ngầm
      }

      // bắt đầu lấy code user để so sánh
      const fullUserCode = this.renderHtml(html, css, js);
      await page.setContent(fullUserCode, { waitUntil: 'load' }); // đưa html vào page chạy
      await page.setViewport({
        width: targetDesign.width,
        height: targetDesign.height,
      });
      await new Promise(resolve => setTimeout(resolve, 1000)); // load trang

      const userScreenshot = await page.screenshot({ type: 'png' }); // screenshot usercode
      const targetScreenshot = this.targetImage.get(exerciseId); // target screenshot
      if (!targetScreenshot) {
        throw new Error(
          `Target image cache missing for exercise ${exerciseId}`,
        );
      }

      // So sánh 2 ảnh
      // buffer -> object có width, height, data (data sẽ là mảng 1 chiều, 1 phần tử là 1 array nhỏ với mã RGBA của 1 điểm ảnh)
      const userImg = PNG.sync.read(Buffer.from(userScreenshot)); // buffer -> object
      const targetImg = PNG.sync.read(targetScreenshot);
      const { width, height } = targetImg;
      const diff = new PNG({ width, height }); // khác pixel nào thì phần này sẽ bị tô màu

      // tính toán số pixel khác nhau và tính kết quả
      const matchPixelCount = pixelmatch(
        userImg.data,
        targetImg.data,
        diff.data,
        width,
        height,
        { threshold: 0.15 },
      );
      // để threshold là 0.15 là cho phép sai lệch cỡ 15%

      const totalPixelCount = width * height;
      const matchPercentage =
        ((totalPixelCount - matchPixelCount) / totalPixelCount) * 100;
      const isPassed = matchPercentage >= 90;

      // diff -> buffer -> url cho FE render ra cho user biết sai chỗ nào
      let diffImage = null;
      if (!isPassed) {
        const diffBuffer = PNG.sync.write(diff);
        diffImage = `data:image/png;base64,${diffBuffer.toString('base64')}`; // hình được mã hóa thành text
      }

      return [
        {
          deviceType: targetDesign.deviceType,
          passed: isPassed,
          matchPercentage: parseFloat(matchPercentage.toFixed(2)),
          diffImageUrl: diffImage,
        },
      ];
    } catch (error: any) {
      throw new Error(`Visual regression evaluation failed: ${error.message}`);
    } finally {
      if (page && !page.isClosed()) {
        await page.close();
      }
    }
  }

  private renderHtml(html: string, css: string, js: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const htmlBody = document.querySelector('body')?.innerHTML || '';
    const htmlHead = document.querySelector('head')?.innerHTML || '';
    const fullHtmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    ${htmlHead}
                    <style> ${css} </style>
                </head>
                <body>
                    ${htmlBody}
                    <script>${js}</script>
                </body>
                </html>
            `;
    return fullHtmlContent;
  }
}
