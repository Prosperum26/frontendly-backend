import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import {
  EntranceTestQuestion,
  EntranceTestQuestionSchema,
} from './db_schemas/entrance-test.schema';
import { EntranceTestController } from './entrance-test.controller';
import { EntranceTestService } from './entrance-test.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: EntranceTestQuestion.name, schema: EntranceTestQuestionSchema },
    ]),
  ],
  controllers: [EntranceTestController],
  providers: [EntranceTestService],
})
export class EntranceTestModule {}
