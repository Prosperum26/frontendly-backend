import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';

@Injectable()
export class CheckLintExternalJs {
  async checkJs(js: string): Promise<{ line: number; message: string }[]> {
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
            // Gom thêm mấy cái này cho chắc cú, tránh báo lỗi ảo
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
      }); // Lá bùa trấn phái

      const result = await eslint.lintText(js);
      const lintResult = result[0].messages.map((err: any) => {
        return {
          line: err.line || 1,
          message: err.message,
        };
      });

      return lintResult;
    } catch (error: any) {
      // Đỡ đạn cho server khi học viên code sai cú pháp trầm trọng
      return [
        {
          line: 1,
          message: `Compiler Error: ${error.message}`,
        },
      ];
    }
  }
}
