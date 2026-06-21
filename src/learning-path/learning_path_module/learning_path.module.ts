import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExerciseSchema } from '../../editor/db_schemas/exercise_schema';
import {
  CanonicalMap,
  CanonicalMapSchema,
} from '../../entrance-test/db_schemas/canonical-map.schema';
import {
  CourseTheory,
  CourseTheorySchema,
} from '../../entrance-test/db_schemas/course-theory.schema';
import {
  EntranceTest,
  EntranceTestSchema,
} from '../../entrance-test/db_schemas/entrance-test.schema';
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
  LpExercisesController,
  LearningContentController,
} from '../learning_path_controllers/learning_path.controller';
import {
  XpService,
  StageContextService,
  ProgressService,
  UserUtilsService,
} from '../learning_path_service';
import { LearningPathService } from '../learning_path_service/learning_path.service';
import { PathBuilderService } from '../learning_path_service/path-builder.service';
import { PlacementService } from '../learning_path_service/placement.service';
import { PracticeService } from '../learning_path_service/practice.service';
import { ProgressSummaryService } from '../learning_path_service/progress-summary.service';
import { RoadmapService } from '../learning_path_service/roadmap.service';
import { StageService } from '../learning_path_service/stage.service';
import { TheoryService } from '../learning_path_service/theory.service';
import { VideoService } from '../learning_path_service/video.service';
import { UserModule } from '@/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Milestone', schema: MilestoneSchema },
      { name: 'Theory', schema: TheorySchema },
      { name: 'LpExercise', schema: LpExerciseSchema },
      { name: 'Roadmap', schema: RoadmapSchema },
      { name: 'UserLearningProgress', schema: UserLearningProgressSchema },
      { name: EntranceTest.name, schema: EntranceTestSchema },
      { name: CanonicalMap.name, schema: CanonicalMapSchema },
      { name: CourseTheory.name, schema: CourseTheorySchema },
      { name: 'Exercise', schema: ExerciseSchema },
    ]),
    UserModule,
  ],
  controllers: [
    RoadmapController,
    StagesController,
    LpExercisesController,
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
    PathBuilderService,
    ProgressSummaryService,
    XpService,
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
    PathBuilderService,
    ProgressSummaryService,
    XpService,
    StageContextService,
    ProgressService,
    UserUtilsService,
    MongooseModule,
  ],
})
export class LearningPathModule {}
