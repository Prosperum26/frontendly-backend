import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserController } from './controllers';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { UserGateway } from './gateways';
import { User, UserSchema } from './schemas';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';
import { Badge, BadgeSchema } from './schemas/badge.schema';
import {
  StageProgress,
  StageProgressSchema,
} from './schemas/stage-progress.schema';
import { GamificationService } from './services/gamification.service';
import { UserService } from './services/user.service'; // Đường dẫn file service của bạn
import { AuthModule } from '@/auth/auth.module';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { UserLearningProgressSchema } from '@/learning-path/db_schemas/learning_path_schemas';
import { MilestoneSchema } from '@/learning-path/db_schemas/milestone_schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: StageProgress.name, schema: StageProgressSchema },
      { name: 'UserLearningProgress', schema: UserLearningProgressSchema },
      { name: 'Milestone', schema: MilestoneSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, LeaderboardController],
  providers: [UserService, CloudinaryService, UserGateway, GamificationService],
  exports: [UserService, GamificationService, CloudinaryService],
})
export class UserModule {}
