import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExerciseSchema } from '../db_schemas/exercise_schema';
import { SubmissionSchema } from '../db_schemas/submission_schema';
import { UserSchema } from '../db_schemas/userFake_schema';
import { EditorController } from '../editor_controllers/editor.controller';
import { EditorService } from '../editor_service/editor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Exercise', schema: ExerciseSchema },
      { name: 'Submission', schema: SubmissionSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
