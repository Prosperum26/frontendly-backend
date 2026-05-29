import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // 👉 1. DANH SÁCH CẤM CỬA
  {
    ignores: [
      "output/",
      "coverage/",
      "reports/",
      "dist/",
      "module/",
      "node_modules/",
      "**/*.d.ts",
      "**/*.d.js",
      "**/*.js",
      "public/",
      "**/*.config.js",
      "**/*.json",
      "eslint.config.mjs"
    ]
  },

  ...compat.config({
    overrides: [
      {
        files: ['**/*.ts'],

        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: true, 
          tsconfigRootDir: import.meta.dirname,
          sourceType: 'module',
        },

        plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports', 'import'],
        extends: [
          'eslint:recommended',
          'plugin:sonarjs/recommended-legacy',
          'plugin:@typescript-eslint/recommended',
          'plugin:@typescript-eslint/recommended-requiring-type-checking',
          'plugin:prettier/recommended',
          'prettier',
        ],
        env: {
          node: true,
          jest: true,
        },

        rules: {
          '@typescript-eslint/interface-name-prefix': 'off',
          '@typescript-eslint/explicit-function-return-type': 'off',
          '@typescript-eslint/explicit-module-boundary-types': 'off',
          '@typescript-eslint/no-explicit-any': 'off',
          'class-methods-use-this': 'off',
          'prettier/prettier': ['error', { endOfLine: 'auto' }],
          'consistent-return': 'off',
          'func-names': 'off',
          'newline-per-chained-call': 'off',
          'no-await-in-loop': 'off',
          'no-continue': 'off',
          'no-param-reassign': ['error', { props: false }],
          'no-restricted-syntax': [
            'error',
            'ForInStatement',
            'LabeledStatement',
            'WithStatement',
          ],
          'no-underscore-dangle': ['error', { allow: ['_id'] }],
          'no-void': ['error', { allowAsStatement: true }],
          'object-curly-newline': 'off',
          'spaced-comment': [
            'error',
            'always',
            { line: { markers: ['/', '#region', '#endregion'] } },
          ],
          
          'no-dupe-class-members': 'off',
          'no-loop-func': 'off',
          'no-return-await': 'off',
          'no-unused-expressions': 'off',
          'max-classes-per-file': 'off',
          
          'import/named': 'off',
          'import/no-default-export': 'off',
          'import/order': [
            'error',
            {
              groups: [['builtin', 'external', 'internal']],
              'newlines-between': 'always',
              alphabetize: { order: 'asc', caseInsensitive: true },
            },
          ],
          'import/prefer-default-export': 'off',
          'import/extensions': 'off',
          
          '@typescript-eslint/consistent-indexed-object-style': 'error',
          '@typescript-eslint/consistent-type-assertions': [
            'error',
            { assertionStyle: 'angle-bracket' },
          ],
          '@typescript-eslint/member-ordering': 'error',
          '@typescript-eslint/no-dupe-class-members': 'error',
          '@typescript-eslint/no-floating-promises': [
            'error',
            { ignoreIIFE: true, ignoreVoid: true },
          ],
          '@typescript-eslint/no-inferrable-types': [
            'error',
            { ignoreParameters: true, ignoreProperties: true },
          ],
          '@typescript-eslint/no-loop-func': 'error',
          '@typescript-eslint/no-misused-promises': [
            'error',
            { checksVoidReturn: false },
          ],
          '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
          '@typescript-eslint/no-unnecessary-condition': 'error',
          '@typescript-eslint/no-unnecessary-qualifier': 'error',
          '@typescript-eslint/no-unnecessary-type-arguments': 'error',
          '@typescript-eslint/no-unnecessary-type-assertion': 'off',
          '@typescript-eslint/no-unnecessary-type-constraint': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'off',
          '@typescript-eslint/no-unsafe-member-access': 'off',
          '@typescript-eslint/no-unsafe-argument': 'off',
          '@typescript-eslint/no-unsafe-call': 'off',
          '@typescript-eslint/no-unsafe-return': 'off',
          '@typescript-eslint/no-unnecessary-condition': 'off',
          '@typescript-eslint/no-require-imports': 'off',
          '@typescript-eslint/no-unused-expressions': 'error',
          '@typescript-eslint/prefer-includes': 'off',
          '@typescript-eslint/prefer-optional-chain': 'error',
          '@typescript-eslint/promise-function-async': 'error',
          '@typescript-eslint/restrict-template-expressions': 'off',
          '@typescript-eslint/no-base-to-string': 'off',
          '@typescript-eslint/no-unsafe-enum-comparison': 'off',
          '@typescript-eslint/typedef': 'off',
          '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
          
          'sonarjs/no-duplicate-string': 'off',
          'sonarjs/null-dereference': 'off',
          'sonarjs/cognitive-complexity': 'off',
          'sonarjs/assertions-in-tests': 'off',
          'sonarjs/no-redundant-assignments': 'off',
          'no-case-declarations': 'off',
          
          'unused-imports/no-unused-imports': 'error',
          'unused-imports/no-unused-vars': [
            'warn',
            {
              vars: 'all',
              varsIgnorePattern: '^_',
              args: 'after-used',
              argsIgnorePattern: '^_',
            },
          ],
          
          '@typescript-eslint/naming-convention': [
            'warn',
            { selector: 'default', format: ['strictCamelCase'] },
            {
              selector: 'variable',
              format: ['strictCamelCase', 'UPPER_CASE', 'StrictPascalCase'],
            },
            {
              selector: 'parameter',
              modifiers: ['unused'],
              format: ['strictCamelCase'],
              leadingUnderscore: 'allow',
            },
            { selector: 'property', format: null },
            { selector: 'typeProperty', format: null },
            { selector: 'typeLike', format: ['StrictPascalCase'] },
            { selector: 'enumMember', format: ['UPPER_CASE'] },
          ],
        },
      }
    ]
  })
];