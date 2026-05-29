import { Injectable } from '@nestjs/common';

import { LintEvaluation } from '../dtos/lint_evaluators.dto';
import { CheckLintExternalCss } from '../evaluators/lint/externalCSS.evaluator';
import { CheckLintExternalJs } from '../evaluators/lint/externalJS.evaluator';
import { CheckLintHtml } from '../evaluators/lint/html.evaluators';
import { CheckLintInternalCss } from '../evaluators/lint/internalCSS.evaluator';
import { CheckLintInternalJs } from '../evaluators/lint/internalJS.evaluator';

@Injectable()
export class CheckLint {
  constructor(
    private readonly checkLintHtml: CheckLintHtml,
    private readonly checkLintExternalCss: CheckLintExternalCss,
    private readonly checkLintInternalCss: CheckLintInternalCss,
    private readonly checkLintExternalJs: CheckLintExternalJs,
    private readonly checkLintInternalJs: CheckLintInternalJs,
  ) {}

  async checkLintUserCode(
    html: string,
    css: string,
    javascript: string,
  ): Promise<LintEvaluation> {
    try {
      const htmlCheck = await this.checkLintHtml.checkHtml(html);
      const cssCheck = await this.checkLintExternalCss.checkCss(css);
      const jsCheck = await this.checkLintExternalJs.checkJs(javascript);

      let HtmlErr = [...htmlCheck];
      const CssErr = [...cssCheck];
      const JsErr = [...jsCheck];

      if (html && htmlCheck) {
        const inCssCheck = await this.checkLintInternalCss.checkCss(html);
        const inJsCheck = await this.checkLintInternalJs.checkJs(html);
        HtmlErr = [...htmlCheck, ...inCssCheck, ...inJsCheck];
      }
      return {
        html_err: HtmlErr,
        css_err: CssErr,
        js_err: JsErr,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error in evaluation process: ${error.message}`);
      }
      throw new Error('Error in evaluation process...');
    }
  }
}
