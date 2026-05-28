import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  LpExerciseSchema,
  RoadmapSchema,
  UserLearningProgressSchema,
} from '../db_schemas/learning_path_schemas';
import { MilestoneSchema } from '../db_schemas/milestone_schema';
import { TheorySchema } from '../db_schemas/theory_schema';
import {
  RoadmapController,
  StagesController,
  ExercisesController,
  LearningContentController,
} from '../learning_path_controllers/learning_path.controller';
import { LearningPathService } from '../learning_path_service/learning_path.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Milestone', schema: MilestoneSchema },
      { name: 'Theory', schema: TheorySchema },
      { name: 'LpExercise', schema: LpExerciseSchema },
      { name: 'Roadmap', schema: RoadmapSchema },
      { name: 'UserLearningProgress', schema: UserLearningProgressSchema },
    ]),
  ],
  controllers: [
    RoadmapController,
    StagesController,
    ExercisesController,
    LearningContentController,
  ],
  providers: [LearningPathService],
})
export class LearningPathModule {}
