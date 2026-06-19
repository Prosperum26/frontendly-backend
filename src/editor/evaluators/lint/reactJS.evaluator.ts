import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';

@Injectable()
export class CheckLintReact {
  private eslint: ESLint;

  constructor() {
    this.eslint = new ESLint(<any>{
      useEslintrc: false,
      overrideConfig: {
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
        env: {
          browser: true,
          es2021: true,
          node: true,
        },
        plugins: ['react', 'react-hooks'],
        rules: {
          // js
          'no-undef': 'error',
          'no-unused-vars': 'warn',
          'no-const-assign': 'error',
          'no-dupe-keys': 'error',
          'no-unreachable': 'error',
          // react
          'react/jsx-uses-react': 'error',
          'react/jsx-uses-vars': 'error',
          'react/jsx-no-undef': 'error',
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': 'warn',
        },
      },
    });
  }

  async checkReact(
    jsxContent: string,
  ): Promise<{ line: number; message: string }[]> {
    if (!jsxContent || jsxContent.trim() === '') return [];

    try {
      const result = await this.eslint.lintText(jsxContent);
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
