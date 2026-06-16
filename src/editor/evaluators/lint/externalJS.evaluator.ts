import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';

@Injectable()
export class CheckLintExternalJs {
  async checkJs(js: string): Promise<{ line: number; message: string }[]> {
    if (!js || js.trim() === '') return [];
    const eslint = new ESLint(<any>{
      overrideConfigFile: <any>true,
      useEslintrc: false, // Tắt sử dụng file .eslintrc tự động
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
        line: err.line,
        message: err.message,
      };
    });
    return lintResult;
  }
}
