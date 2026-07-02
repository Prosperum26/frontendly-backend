import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { Exercise, ExerciseSchema } from '../editor/db_schemas/exercise_schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
})
export class ChallengeModule {}
