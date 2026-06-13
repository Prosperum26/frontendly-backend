import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { VisualEvaluationDto } from '../dtos/visual_regression.dto';
import { PuppeteerEvaluator } from '../evaluators/visual-regression/puppeteer_run.evaluator';

@Injectable()
export class VisualRegressionService {
  constructor(private readonly puppeteerEvaluator: PuppeteerEvaluator) {}

  async evaluateVisual(
    html: string,
    css: string,
    js: string,
    targetDesigns: any[],
  ): Promise<VisualEvaluationDto[]> {
    const browser = this.puppeteerEvaluator.getBrowser(); // Mở 1 cái trên server chạy ngầm
    const page = await browser.newPage(); // Tab mới
    try {
      const visualResults: VisualEvaluationDto[] = [];

      if (!html?.trim() && !css?.trim() && !js?.trim()) {
        return targetDesigns.map(design => ({
          deviceType: design.deviceType,
          passed: false,
          matchPercentage: 0,
          diffImageUrl: null,
        }));
      }

      const dom = new JSDOM(html);
      const document = dom.window.document;
      const htmlBody = document.querySelector('body')?.innerHTML || '';
      const htmlHead = document.querySelector('head')?.innerHTML || '';

      // Vì cho user code html từ đầu nên cần tạo cây dom, lấy ra rồi đưa nào vào head, body xong mới có
      // thẻ style và thẻ script để chèn css và js được
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

      await page.setContent(fullHtmlContent, { waitUntil: 'load' }); // đưa html vào page chạy
      for (const design of targetDesigns) {
        await page.setViewport({ width: design.width, height: design.height });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1s cho trang load xong hết

        // Render code user rồi chụp màn hình => Lưu vô RAM
        const userScreenshot = await page.screenshot({ type: 'png' });

        // Lấy target design từ database rồi đưa thành buffer => Lưu vào RAM
        const response = await axios.get(design.url, {
          responseType: 'arraybuffer',
        }); // trả về json
        const targetDesignBuffer = Buffer.from(response.data); // đưa về buffer

        // So sánh 2 ảnh
        // Từ buffer đưa về object có width, height, data (data sẽ là mảng 1 chiều, 1 phần tử là 1 array nhỏ với mã RGBA của 1 điểm ảnh)
        const userImg = PNG.sync.read(Buffer.from(userScreenshot)); // giải buffer thành object
        const targetImg = PNG.sync.read(targetDesignBuffer); // giải buffer thành object
        const { width, height } = targetImg;
        const diff = new PNG({ width, height }); // Có khác pixel nào thì phần này sẽ bị tô màu

        // Tính toán số pixel khác nhau và tính kết quả
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
        const diffBuffer = PNG.sync.write(diff);
        const diffImageUrl = `data:image/png;base64,${diffBuffer.toString('base64')}`;

        visualResults.push({
          deviceType: design.deviceType,
          passed: isPassed,
          matchPercentage: parseFloat(matchPercentage.toFixed(2)),
          diffImageUrl: isPassed ? null : diffImageUrl, // Ko cần trả ảnh nếu đã pass
        });
      }
      return visualResults;
    } catch (error: any) {
      throw new Error(`Visual regression evaluation failed: ${error.message}`);
    } finally {
      if (page && !page.isClosed()) {
        await page.close();
      }
    }
  }
}
