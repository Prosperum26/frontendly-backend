import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import {
  ChallengeExercise,
  ChallengeExerciseSchema,
} from './db_schemas/challenge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChallengeExercise.name, schema: ChallengeExerciseSchema },
    ]),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
})
export class ChallengeModule {}
