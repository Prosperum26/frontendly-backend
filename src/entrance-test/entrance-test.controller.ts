import { Body, Controller, Get, Post } from '@nestjs/common';

import { EntranceTestService } from './entrance-test.service';
import {
  EntranceTestQuestion,
  EntranceTestResult,
} from './entrance-test.types';
import { ConfigureAuth } from '@/auth/decorators';

@ConfigureAuth({ blockIfUnauthenticated: false })
@Controller({ path: 'entrance-test', version: '1' })
export class EntranceTestController {
  constructor(private readonly entranceTestService: EntranceTestService) {}

  @Get('questions')
  getQuestions(): EntranceTestQuestion[] {
    return this.entranceTestService.getQuestions();
  }

  @Post('submit')
  submitTest(
    @Body('answers') answers: Record<string, unknown> = {},
  ): EntranceTestResult {
    return this.entranceTestService.submit(answers);
  }
}
