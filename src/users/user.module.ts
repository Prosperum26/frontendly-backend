import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserController } from './controllers';
import { UserGateway } from './gateways';
import { User, UserSchema } from './schemas';
import { Badge, BadgeSchema } from './schemas/badge.schema';
import {
  StageProgress,
  StageProgressSchema,
} from './schemas/stage-progress.schema';
import { UserService } from './services';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: StageProgress.name, schema: StageProgressSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserGateway],
  exports: [UserService],
})
export class UserModule {}
