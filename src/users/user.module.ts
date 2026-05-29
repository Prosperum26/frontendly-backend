import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserController } from './controllers';
import { UserGateway } from './gateways';
import { User, UserSchema } from './schemas';
import { UserService } from './services';
import { AuthModule } from '@/auth/auth.module';
import {
  UserLearningProgressSchema,
} from '@/learning-path/db_schemas/learning_path_schemas';
import { MilestoneSchema } from '@/learning-path/db_schemas/milestone_schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'UserLearningProgress', schema: UserLearningProgressSchema },
      { name: 'Milestone', schema: MilestoneSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserGateway],
  exports: [UserService],
})
export class UserModule {}
