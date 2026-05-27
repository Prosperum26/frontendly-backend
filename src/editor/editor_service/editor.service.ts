import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';

import { LintEvaluation } from '../dtos/lint_evaluators.dto';
import { CheckLintHtml } from '../evaluators/lint/html.evaluators';
import { CheckLintExternalCss } from '../evaluators/lint/externalCSS.evaluator';
import { CheckLintInternalCss } from '../evaluators/lint/internalCSS.evaluator';
import { CheckLintExternalJs } from '../evaluators/lint/externalJS.evaluator';
import { CheckLintInternalJs } from '../evaluators/lint/internalJS.evaluator';

@Injectable()
export class EditorService {
  constructor(
    @InjectModel('Exercise')
    private readonly exerciseModel: Model<ExerciseDocument>,
  ) {}

  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .select('-_id')
      .lean();
    if (!exercise) {
      throw new NotFoundException('Cannot find exercise');
    }
    return exercise;
  }
}

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
