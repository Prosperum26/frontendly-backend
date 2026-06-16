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
    const eslint = new ESLint(<any>{
      overrideConfigFile: <any>true,
      useEslintrc: false,
      overrideConfig: <any>{
        env: {
          browser: true,
          es2021: true,
          node: true,
        },
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        rules: {
          'no-undef': 'error',
          'no-const-assign': 'error',
          'no-dupe-keys': 'error',
          'no-unreachable': 'error',
          'use-isnan': 'error',
          'for-direction': 'error',
          'no-unused-vars': 'warn',
          eqeqeq: ['warn', 'always'],
          'no-empty': 'warn',
          'no-console': 'off',
        },
      },
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
