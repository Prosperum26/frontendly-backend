import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';
import { JSDOM } from 'jsdom';

@Injectable()
export class CheckLintInternalJs {
  async checkJs(html: string): Promise<{ line: number; message: string }[]> {
    if (!html || html.trim() === '') return [];

    const HTML = new JSDOM(html?.trim(), {
      runScripts: 'dangerously',
      url: 'https://example.com',
    });
    const { document } = HTML.window;
    const script = document.querySelectorAll('script');

    let js = '';
    script.forEach((internalJs: HTMLScriptElement) => {
      js += internalJs.innerHTML;
    });

    if (!js || js.trim() === '') return [];
    const eslint = new ESLint({
      overrideConfigFile: true, // không xài eslint của project
      overrideConfig: [
        {
          languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
              // biến trình duyệt
              document: 'readonly',
              window: 'readonly',
              console: 'readonly',
              setTimeout: 'readonly',
              setInterval: 'readonly',
              alert: 'readonly',
              localStorage: 'readonly',
              sessionStorage: 'readonly',
            },
          },
          rules: {
            'no-undef': 'error', // sai variables/function
            'no-const-assign': 'error', // ko gán giá trị mới cho const
            'no-dupe-keys': 'error', // unique key in object
            'no-unreachable': 'error', // sau return/break => ko có code
            'use-isnan': 'error', // isNaN
            'for-direction': 'error', // infinite loop

            'no-unused-vars': 'warn', // ko xài variables/function đã khai báo
            eqeqeq: ['warn', 'always'], // xài ===
            'no-empty': 'warn', // empty block
            'no-console': 'off', // cho console.log
          },
        },
      ],
    });

    const result = await eslint.lintText(js);
    const lintResult = result[0].messages.map((err: any) => {
      return {
        line: 0,
        message: `In <script> tag (line ${err.line}), the error: ${err.message}`,
      };
    });
    return lintResult;
  }
}
