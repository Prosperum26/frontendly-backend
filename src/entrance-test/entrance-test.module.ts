import { Module } from '@nestjs/common';

import { EntranceTestController } from './entrance-test.controller';
import { EntranceTestService } from './entrance-test.service';
import { LearningPathModule } from '../learning-path/learning_path_module/learning_path.module';

@Module({
  imports: [LearningPathModule],
  controllers: [EntranceTestController],
  providers: [EntranceTestService],
  exports: [EntranceTestService],
})
export class EntranceTestModule {}
