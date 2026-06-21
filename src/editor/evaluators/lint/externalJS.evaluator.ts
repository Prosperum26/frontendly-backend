import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';

@Injectable()
export class CheckLintExternalJs {
  async checkJs(js: string): Promise<{ line: number; message: string }[]> {
    if (!js || js.trim() === '') return [];

    try {
      const eslint = new ESLint(<any>{
        overrideConfigFile: false,
        useEslintrc: false,
        overrideConfig: {
          env: {
            browser: true,
            es2021: true,
            node: true,
          },
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
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
      });

      const result = await eslint.lintText(js);
      const lintResult = result[0].messages.map((err: any) => {
        return {
          line: err.line || 1,
          message: err.message,
        };
      });

      return lintResult;
    } catch (error: any) {
      return [
        {
          line: 1,
          message: `Compiler Error: ${error.message}`,
        },
      ];
    }
  }
}
