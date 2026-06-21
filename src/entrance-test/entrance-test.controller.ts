import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { EntranceTestService } from './entrance-test.service';
import {
  EntranceTestQuestion,
  EntranceTestResult,
  PersonalizedPathResult,
} from './entrance-test.types';
import { ConfigureAuth } from '@/auth/decorators';

@ConfigureAuth({ blockIfUnauthenticated: false })
@Controller({ path: 'entrance-test', version: '1' })
export class EntranceTestController {
  constructor(private readonly entranceTestService: EntranceTestService) {}

  @Get('questions')
  async getQuestions(): Promise<{
    success: boolean;
    data: EntranceTestQuestion[];
  }> {
    return {
      success: true,
      data: await this.entranceTestService.getQuestions(),
    };
  }

  @Post('submit')
  async submitTest(
    @Body('answers') answers: Record<string, string> = {},
  ): Promise<{
    success: boolean;
    data: EntranceTestResult;
  }> {
    return {
      success: true,
      data: await this.entranceTestService.submit(answers),
    };
  }

  @Post('path/:userId')
  async getPersonalizedPath(
    @Param('userId') userId: string,
    @Body('answers') answers: Record<string, string> = {},
  ): Promise<{
    success: boolean;
    data: PersonalizedPathResult;
  }> {
    return {
      success: true,
      data: await this.entranceTestService.getPersonalizedPath(userId, answers),
    };
  }
}
