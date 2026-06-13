import { Injectable } from '@nestjs/common';
import { JSDOM, VirtualConsole } from 'jsdom';

import { RequirmentsEvaluationDto } from '../../dtos/requirement_evaluators';

@Injectable()
export class RequirementEvaluator {
  evaluateCode(
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
}
