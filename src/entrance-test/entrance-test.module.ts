import { Module } from '@nestjs/common';

import { EntranceTestController } from './entrance-test.controller';
import { EntranceTestService } from './entrance-test.service';

@Module({
  controllers: [EntranceTestController],
  providers: [EntranceTestService],
})
export class EntranceTestModule {}
