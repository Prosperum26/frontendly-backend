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

          case 'content':
            const selectorContent = container.querySelector(req.selector);
            if (selectorContent) {
              const expectedContent = req.expectedValue;
              if (expectedContent) {
                const hasContent = selectorContent.textContent
                  ?.trim()
                  .includes(expectedContent.trim());
                if (hasContent) isPassed = true;
              }
            } else isPassed = false;
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
  ): RequirmentsEvaluationDto[] {
    if (!jsx || jsx.trim() === '') {
      return requirements.map(req => ({
        requirementId: req.id,
        passed: false,
      }));
    }

    // tạo cấy cấu trúc AST
    try {
      const ast = parser.parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx'],
      });

      // lưu trữ dom
      const elementsCount: Record<string, number> = {}; // số lượng thẻ
      const textContents = new Set<string>(); // các đoạn text
      const attributes = new Set<string>(); // tên các props/attributes
      const hooks = new Set<string>(); // tên các hook

      // quét cây cấu trúc AST của toàn bộ code
      /* eslint-disable @typescript-eslint/naming-convention */
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
          // lấy text
          if (path.node.value.trim()) {
            textContents.add(path.node.value.trim());
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
      });
      return requirements.map(req => {
        let isPassed = false;
        switch (req.type) {
          case 'exist':
            isPassed =
              (elementsCount[req.selector] || 0) > 0 || hooks.has(req.selector);
            break;

          case 'count':
            const expectedCount = parseInt(req.expectedValue);
            isPassed = (elementsCount[req.selector] || 0) === expectedCount;
            break;

          case 'content':
            const expectedContent = req.expectedValue?.trim();
            if (expectedContent) {
              isPassed = Array.from(textContents).some(text =>
                text.includes(expectedContent),
              );
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
