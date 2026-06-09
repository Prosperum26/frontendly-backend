import { Injectable } from '@nestjs/common';

const { htmlHint } = require('htmlhint');

@Injectable()
export class CheckLintHtml {
  async checkHtml(html: string): Promise<{ line: number; message: string }[]> {
    if (!html || html.trim() === '') return [];
    const config = {
      'doctype-first': true, // có doctype
      'doctype-html5': false,
      'html-lang-require': true, // có lang
      'title-require': true, // có title
      'tag-pair': true, // đóng cặp thẻ
      'tagname-lowercase': true, // tên thẻ viết thường
      'id-unique': true, // 1 id
      'spec-char-escape': true, // tránh viết các kí tự >, <, &
      'attr-lowercase': true, // attribute viết thường
      'attr-value-double-quotes': true, // attribute nằm trong ngoặc kép
      'attr-no-duplication': true, // không lặp attribute
      'src-not-empty': true, // attrbute src không để trống
      'space-tab-mixed-disabled': 'smart', // tab và space mix
      'style-disabled': false, // Cho code internal css
      'inline-style-disabled': true, // Cho inline css
      'inline-script-disabled': true, // Cho inline js
    };
    const result = await htmlHint.verify(html, config);
    const lintResult = result.map((err: any) => {
      return {
        line: err.line,
        message: err.message,
      };
    });
    return lintResult;
  }
}
