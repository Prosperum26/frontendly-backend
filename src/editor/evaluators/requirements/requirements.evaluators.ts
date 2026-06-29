import * as parser from '@babel/parser';
import rawTraverse from '@babel/traverse';
import { Injectable } from '@nestjs/common';
import { JSDOM, VirtualConsole } from 'jsdom';

import { RequirmentsEvaluationDto } from '../../dtos/requirement_evaluators';
const traverse =
  typeof (<any>rawTraverse) === 'function'
    ? <any>rawTraverse
    : (<any>rawTraverse).default;

@Injectable()
export class RequirementEvaluator {
  evaluateCodeHtmlCssJs(
    html: string,
    css: string,
    javascript: string,
    requirements: any[],
  ): RequirmentsEvaluationDto[] {
    let htmlDom: JSDOM | null = null;
    try {
      const virtualConsole = new VirtualConsole();
      htmlDom = new JSDOM(html.trim(), {
        runScripts: 'dangerously',
        virtualConsole: virtualConsole,
        includeNodeLocations: false,
      });
      const document = htmlDom.window.document;

      // Xử lý bài tập HTML cơ bản (không có <html>, <head>, <body>)
      const hasHtmlTag = html.toLowerCase().includes('<html');
      const container = hasHtmlTag ? document : document.body;

      if (css && css.trim() != '') {
        let style = document.querySelector('style');
        if (!style) {
          style = document.createElement('style');
          document.head.appendChild(style);
        }
        style.innerHTML += css.trim();
      }

      if (javascript && javascript.trim() != '') {
        let script = document.querySelector('script');
        if (!script) {
          script = document.createElement('script');
          document.body.appendChild(script);
        }
        script.innerHTML += javascript.trim();
      }

      return requirements.map(req => {
        let isPassed = false;
        switch (req.type) {
          case 'exist':
            const selectorExist = container.querySelector(req.selector);
            isPassed = selectorExist != null;
            break;

          case 'count':
            const selectorCount = container.querySelectorAll(req.selector);
            if (selectorCount) {
              const number = selectorCount.length;
              const expectedCount = parseInt(req.expectedValue);
              isPassed = number === expectedCount;
            } else isPassed = false;
            break;

          // Tìm đến case 'content' trong evaluateCodeHtmlCssJs và sửa thành:
          case 'content':
            const expectedContentHtml = req.expectedValue?.trim();
            if (!expectedContentHtml) {
              isPassed = false;
              break;
            }
            if (
              !req.selector ||
              req.selector.trim() === '' ||
              req.selector === 'body'
            ) {
              isPassed =
                container.textContent?.trim().includes(expectedContentHtml) ||
                false;
            } else {
              try {
                const selectorContent = container.querySelector(req.selector);
                isPassed =
                  selectorContent?.textContent
                    ?.trim()
                    .includes(expectedContentHtml) || false;
              } catch (error: any) {
                isPassed = false;
                console.error('Content test error: ', error);
              }
            }
            break;

          case 'attribute':
            const selectorAttribute = container.querySelector(req.selector);
            if (selectorAttribute) {
              isPassed = selectorAttribute.hasAttribute(req.expectedValue);
            } else isPassed = false;
            break;
          default:
            isPassed = false;
        }
        return {
          requirementId: req.id,
          passed: isPassed,
        };
      });
    } catch (error) {
      console.error('SandBox JSDOM error', error);
      return requirements.map(req => ({
        requirementId: req.id,
        passed: false,
      }));
    } finally {
      if (htmlDom) {
        htmlDom.window.close();
      }
    }
  }

  evaluateCodeReact(
    jsx: string,
    requirements: any[],
    files?: { filename: string; language: string; content: string }[],
  ): RequirmentsEvaluationDto[] {
    // Handle multi-file submissions
    let jsxToEvaluate = jsx;
    if (files && files.length > 0) {
      const jsxFile = files.find((f: any) => f.language === 'jsx');
      if (jsxFile) {
        jsxToEvaluate = jsxFile.content;
      }
    }

    if (!jsxToEvaluate || jsxToEvaluate.trim() === '') {
      return requirements.map(req => ({
        requirementId: req.id,
        passed: false,
      }));
    }

    // tạo cấy cấu trúc AST
    try {
      const ast = parser.parse(jsxToEvaluate, {
        sourceType: 'module',
        plugins: ['jsx'],
      });

      // lưu trữ dom
      const elementsCount: Record<string, number> = {}; // số lượng thẻ
      const textContents = new Set<string>(); // các đoạn text
      const attributes = new Set<string>(); // tên các props/attributes
      const hooks = new Set<string>(); // tên các hook
      const imports = new Set<string>();
      const exportsSet = new Set<string>();

      // quét cây cấu trúc AST của toàn bộ code
      /* eslint-disable @typescript-eslint/naming-convention */
      const elementTextContents: Record<string, Set<string>> = {};

      traverse(ast, {
        JSXOpeningElement(path: any) {
          // lấy các thẻ
          const nodeName = path.node.name;
          if (nodeName.type === 'JSXIdentifier') {
            const tagName = nodeName.name;
            elementsCount[tagName] = (elementsCount[tagName] || 0) + 1;
          }
        },
        JSXAttribute(path: any) {
          const attrName = path.node.name;
          if (attrName.type === 'JSXIdentifier') {
            attributes.add(attrName.name);
            if (path.node.value?.type === 'StringLiteral') {
              attributes.add(
                `${attrName.name}=${path.node.value.value.trim()}`,
              );
            }
          }
        },
        JSXText(path: any) {
          const textValue = path.node.value.trim();
          if (textValue) {
            textContents.add(textValue);
            const parent = path.parent;
            if (
              parent.type === 'JSXElement' &&
              parent.openingElement.name.type === 'JSXIdentifier'
            ) {
              const tagName = parent.openingElement.name.name;
              if (!elementTextContents[tagName]) {
                elementTextContents[tagName] = new Set();
              }
              elementTextContents[tagName].add(textValue);
            }
          }
        },
        StringLiteral(path: any) {
          // lấy text được gán vào biến
          if (path.node.value.trim()) {
            textContents.add(path.node.value.trim());
          }
        },
        Identifier(path: any) {
          hooks.add(path.node.name);
        },
        CallExpression(path: any) {
          const callee = path.node.callee;
          if (callee.type === 'Identifier') {
            const hookName = callee.name;
            if (hookName === 'useState') {
              const parent = path.parent;
              if (
                parent.type === 'VariableDeclarator' &&
                parent.id.type === 'ArrayPattern' &&
                parent.id.elements.length >= 2
              ) {
                hooks.add(hookName);
              }
            } else if (hookName === 'useRef') {
              const parent = path.parent;
              if (
                parent.type === 'VariableDeclarator' &&
                parent.id.type === 'Identifier'
              ) {
                hooks.add(hookName);
              }
            } else if (hookName === 'useEffect') {
              const args = path.node.arguments;
              if (args.length > 0) {
                const firstArgType = args[0].type;
                if (
                  firstArgType === 'ArrowFunctionExpression' ||
                  firstArgType === 'FunctionExpression' ||
                  firstArgType === 'Identifier'
                ) {
                  hooks.add(hookName);
                }
              }
            } else {
              hooks.add(hookName);
            }
          }
        },
        ImportDeclaration(path: any) {
          // check các phần import
          const defaultSpecifier = path.node.specifiers.find(
            (s: any) => s.type === 'ImportDefaultSpecifier',
          );

          if (defaultSpecifier) {
            const importName = defaultSpecifier.local.name;
            imports.add(`import ${importName}`);
          }
        },
        ExportNamedDeclaration(path: any) {
          // Kiểm tra xem đây có phải là dạng: export function TênHàm()
          if (path?.node?.declaration?.type === 'FunctionDeclaration') {
            const funcName = path.node.declaration.id.name; // Lấy ra chữ 'Product'
            exportsSet.add(`export function ${funcName}`);
          }
        },
      });

      /* eslint-disable */
      return requirements.map(req => {
        let isPassed = false;
        switch (req.type) {
          case 'exist':
            isPassed =
              (elementsCount[req.selector] || 0) > 0 ||
              hooks.has(req.selector) ||
              imports.has(req.selector) ||
              exportsSet.has(req.selector);
            break;

          case 'count':
            const expectedCount = parseInt(req.expectedValue);
            isPassed = (elementsCount[req.selector] || 0) === expectedCount;
            break;

          case 'content':
            const expectedContentReact = req.expectedValue?.trim();
            if (expectedContentReact) {
              if (
                !req.selector ||
                req.selector === 'body' ||
                req.selector === 'root'
              ) {
                isPassed = Array.from(textContents).some(text =>
                  text.includes(expectedContentReact),
                );
              } else if (
                elementTextContents &&
                elementTextContents[req.selector]
              ) {
                isPassed = Array.from(elementTextContents[req.selector]).some(
                  text => text.includes(expectedContentReact),
                );
              } else {
                isPassed = false;
              }
            }
            break;

          case 'attribute':
          case 'prop':
            isPassed = attributes.has(req.selector || req.expectedValue);
            break;

          case 'hook':
            isPassed = hooks.has(req.selector);
            break;
          default:
            isPassed = false;
        }
        return {
          requirementId: req.id,
          passed: isPassed,
        };
      });
    } catch (error: any) {
      console.error('Babel AST Parsing Error:', error);
      return requirements.map(req => ({
        requirementId: req.id,
        passed: false,
      }));
    }
  }
}
