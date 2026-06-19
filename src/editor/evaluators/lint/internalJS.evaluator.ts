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

    try {
      // Dùng as any để TypeScript không la làng, giữ chuẩn v8 cho Node.js chạy
      const eslint = new ESLint(<any>{
        useEslintrc: false,
        overrideConfig: {
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
          env: {
            browser: true,
            node: true,
            es2021: true,
          },
          globals: {
            window: 'readonly',
            document: 'readonly',
            console: 'readonly',
            setTimeout: 'readonly',
            clearTimeout: 'readonly',
            fetch: 'readonly',
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
      }); // <-- Lá bùa quyền lực tiếp tục phát huy tác dụng

      const result = await eslint.lintText(js);
      const lintResult = result[0].messages.map((err: any) => {
        return {
          line: 0,
          message: `In <script> tag (line ${err.line || 1}), the error: ${err.message}`,
        };
      });
      return lintResult;
    } catch (error: any) {
      return [
        {
          line: 0,
          message: `In <script> tag Compiler Error: ${error.message}`,
        },
      ];
    }
  }
}
