import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExerciseSchema } from '../db_schemas/exercise_schema';
import { SubmissionSchema } from '../db_schemas/submission_schema';
import { EditorController } from '../editor_controllers/editor.controller';
import { CheckLint } from '../editor_service/checkLint.service';
import { EditorService } from '../editor_service/editor.service';
import { VisualRegressionService } from '../editor_service/visual_regression.service';
import { CheckLintExternalCss } from '../evaluators/lint/externalCSS.evaluator';
import { CheckLintExternalJs } from '../evaluators/lint/externalJS.evaluator';
import { CheckLintHtml } from '../evaluators/lint/html.evaluators';
import { CheckLintInternalCss } from '../evaluators/lint/internalCSS.evaluator';
import { CheckLintInternalJs } from '../evaluators/lint/internalJS.evaluator';
import { RequirementEvaluator } from '../evaluators/requirements/requirements.evaluators';
import { PuppeteerEvaluator } from '../evaluators/visual regression/puppeteer_run.evaluator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Exercise', schema: ExerciseSchema },
      { name: 'Submission', schema: SubmissionSchema },
    ]),
  ],
  controllers: [EditorController],
  providers: [
    EditorService,
    CheckLint,
    CheckLintHtml,
    CheckLintExternalCss,
    CheckLintInternalCss,
    CheckLintExternalJs,
    CheckLintInternalJs,
    RequirementEvaluator,
    PuppeteerEvaluator,
    VisualRegressionService,
  ],
})
export class EditorModule {}
