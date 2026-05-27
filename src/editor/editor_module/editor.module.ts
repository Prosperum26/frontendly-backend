import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExerciseSchema } from '../db_schemas/exercise_schema';
import { SubmissionSchema } from '../db_schemas/submission_schema';
import { UserSchema } from '../db_schemas/userFake_schema';
import { EditorController } from '../editor_controllers/editor.controller';
import { EditorService } from '../editor_service/editor.service';
import { SandBox } from '../runners/sandbox.runner';
import { CheckLint } from '../editor_service/editor.service';
import { checkLintHtml } from '../evaluators/lint/html.evaluators';
import { checkLintExternalCss } from '../evaluators/lint/externalCSS.evaluator';
import { checkLintInternalCss } from '../evaluators/lint/internalCSS.evaluator';
import { checkLintExternalJs } from '../evaluators/lint/externalJS.evaluator';
import { checkLintInternalJs } from '../evaluators/lint/internalJS.evaluator';

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
    SandBox,
    CheckLint,
    checkLintHtml,
    checkLintExternalCss,
    checkLintInternalCss,
    checkLintExternalJs,
    checkLintInternalJs,
  ],
})
export class EditorModule {}
