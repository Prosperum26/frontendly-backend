import { Injectable } from '@nestjs/common';
import * as htmlhint from 'htmlhint';

@Injectable()
export class CheckLintHtml {
  checkHtml(html: string): { line: number; message: string }[] {
    if (!html || html.trim() === '') return [];
    const config: Record<string, boolean | string> = {
      'doctype-first': true,
      'doctype-html5': false,
      'html-lang-require': true,
      'title-require': true,
      'tag-pair': true,
      'tagname-lowercase': true,
      'id-unique': true,
      'spec-char-escape': true,
      'attr-lowercase': true,
      'attr-value-double-quotes': true,
      'attr-no-duplication': true,
      'src-not-empty': true,
      'space-tab-mixed-disabled': 'smart',
      'style-disabled': false,
      'inline-style-disabled': true,
      'inline-script-disabled': true,
    };
    const result = htmlhint.HTMLHint.verify(html, config);
    const lintResult = result.map((err: any) => {
      return {
        line: err.line,
        message: err.message,
      };
    });
    return lintResult;
  }
}
