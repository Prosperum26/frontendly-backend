import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';

const stylelint = require('stylelint');

@Injectable()
export class CheckLintInternalCss {
  async checkCss(html: string): Promise<{ line: number; message: string }[]> {
    if (!html || html.trim() === '') return [];
    const HTML = new JSDOM(html?.trim(), {
      runScripts: 'dangerously',
      url: 'https://example.com',
    });
    const { document } = HTML.window;
    const styles = document.querySelectorAll('style');

    let internalCSS = '';
    styles.forEach((style: HTMLStyleElement) => {
      internalCSS += style.innerHTML;
    });

    if (!internalCSS || internalCSS.trim() === '') return [];
    const config = {
      rules: {
        'color-no-invalid-hex': true, // mã màu sai
        'property-no-unknown': true, // tên thuộc tính
        'unit-no-unknown': true, // đơn vị
        'selector-type-no-unknown': true, //  tên thẻ HTML
        'selector-pseudo-class-no-unknown': true, //  pseudo-class (vd: :hovver)
        'declaration-block-no-duplicate-properties': true, //  thuộc tính giống nhau
        'no-duplicate-selectors': true, // block CSS trùng selector
        'block-no-empty': true, // class trống
      },
    };

    const result = await stylelint.lint({
      code: internalCSS,
      config: config,
    });

    const lintResult = result.results[0].warnings.map((err: any) => {
      // do trả về json phần warnings nằm trong mảng results chứa lỗi
      return {
        // trong mảng results là lỗi các đoạn code, do chỉ có 1 phần bỏ vào nên đây
        line: 0, // chỉ có 1 ptu nên results[0]
        message: `In <style> tag (line ${err.line}), the error: ${err.message}`,
      };
    });
    return lintResult;
  }
}
