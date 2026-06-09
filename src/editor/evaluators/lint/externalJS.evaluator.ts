import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';

@Injectable()
export class CheckLintExternalJs {
  async checkJs(js: string): Promise<{ line: number; message: string }[]> {
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
        line: err.line,
        message: err.message,
      };
    });
    return lintResult;
  }
}
