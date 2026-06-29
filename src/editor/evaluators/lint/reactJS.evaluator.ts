import { Injectable } from '@nestjs/common';
import { ESLint } from 'eslint';

import { JsxRestrictionAstMap } from '../../db_schemas/exercise.enum'; // Đổi lại đường dẫn import cho đúng vị trí file enum của ông nha

@Injectable()
export class CheckLintReact {
  async checkReact(
    jsxContent: string,
    restrictions: any[] = [],
    files?: { filename: string; language: string; content: string }[],
  ): Promise<{ line: number; message: string }[]> {
    // Handle multi-file submissions
    let jsxToLint = jsxContent;
    if (files && files.length > 0) {
      const jsxFile = files.find((f: any) => f.language === 'jsx');
      if (jsxFile) {
        jsxToLint = jsxFile.content;
      }
    }

    if (!jsxToLint || jsxToLint.trim() === '') return [];

    const restrictedSyntaxes: any[] = [];
    restrictions.forEach(restriction => {
      const ruleKey = restriction.rule;
      if (JsxRestrictionAstMap[ruleKey]) {
        restrictedSyntaxes.push({
          selector: JsxRestrictionAstMap[ruleKey].selector,
          message:
            restriction.message || JsxRestrictionAstMap[ruleKey].defaultMessage, // nếu không có message trong db thì lấy default
        });
      }
    });

    // config
    const eslint = new ESLint(<any>{
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
          // base rules
          'no-undef': 'error',
          'no-unused-vars': 'warn',
          'no-const-assign': 'error',
          'no-dupe-keys': 'error',
          'no-unreachable': 'error',
          'react/jsx-uses-react': 'error',
          'react/jsx-uses-vars': 'error',
          'react/jsx-no-undef': 'error',
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': 'warn',

          // thêm config
          'no-restricted-syntax':
            restrictedSyntaxes.length > 0
              ? ['error', ...restrictedSyntaxes]
              : ['off'],
        },
      },
    });

    // 3. THỰC THI CHẤM ĐIỂM
    try {
      const result = await eslint.lintText(jsxToLint);

      const lintResult = result[0].messages.map((err: any) => {
        return {
          line: err.line || 1,
          message: err.message, // Lỗi từ AST Map chửi như thế nào sẽ hiện thẳng ra đây
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
