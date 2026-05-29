import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExerciseSchema } from '../db_schemas/exercise_schema';
import { SubmissionSchema } from '../db_schemas/submission_schema';
import { UserSchema } from '../db_schemas/userFake_schema';
import { EditorController } from '../editor_controllers/editor.controller';
import { EditorService } from '../editor_service/editor.service';
import { CheckLint } from '../editor_service/checkLint.service';
import { CheckLintHtml } from '../evaluators/lint/html.evaluators';
import { CheckLintExternalCss } from '../evaluators/lint/externalCSS.evaluator';
import { CheckLintInternalCss } from '../evaluators/lint/internalCSS.evaluator';
import { CheckLintExternalJs } from '../evaluators/lint/externalJS.evaluator';
import { CheckLintInternalJs } from '../evaluators/lint/internalJS.evaluator';
import { RequirementEvaluator } from '../evaluators/requirements.evaluators';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Exercise', schema: ExerciseSchema },
      { name: 'Submission', schema: SubmissionSchema },
      { name: 'User', schema: UserSchema },
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
    CheckLint,
  ],
})
export class EditorModule {}
