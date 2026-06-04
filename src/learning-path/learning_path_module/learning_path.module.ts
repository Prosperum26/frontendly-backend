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
import { PlacementService } from '../learning_path_service/placement.service';
import { PracticeService } from '../learning_path_service/practice.service';
import { ProgressSummaryService } from '../learning_path_service/progress-summary.service';
import { RoadmapService } from '../learning_path_service/roadmap.service';
import { StageService } from '../learning_path_service/stage.service';
import { TheoryService } from '../learning_path_service/theory.service';
import { VideoService } from '../learning_path_service/video.service';
import {
  XPService,
  StageContextService,
  ProgressService,
  UserUtilsService,
} from '../learning_path_service';

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
  providers: [
    LearningPathService,
    RoadmapService,
    TheoryService,
    PracticeService,
    VideoService,
    StageService,
    PlacementService,
    ProgressSummaryService,
    XPService,
    StageContextService,
    ProgressService,
    UserUtilsService,
  ],
  exports: [
    LearningPathService,
    RoadmapService,
    TheoryService,
    PracticeService,
    VideoService,
    StageService,
    PlacementService,
    ProgressSummaryService,
    XPService,
    StageContextService,
    ProgressService,
    UserUtilsService,
  ],
})
export class LearningPathModule {}
