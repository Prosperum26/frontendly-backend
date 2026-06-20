import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EntranceTestService } from './entrance-test.service';
import { ReqUser } from '../auth/decorators';
import { AuthGuard } from '../auth/guards';
import { UserDocument } from '../users/schemas/user.schema';

@ApiTags('Entrance Test')
@Controller('entrance-test')
export class EntranceTestController {
  constructor(private readonly entranceTestService: EntranceTestService) {}

  @Get('questions')
  @UseGuards(AuthGuard)
  async getQuestions() {
    return this.entranceTestService.getQuestions();
  }

  @Post('submit')
  @UseGuards(AuthGuard)
  submitTest(
    @ReqUser() user: UserDocument,
    @Body() body: { answers: Record<string, unknown> },
  ) {
    return this.entranceTestService.submitTest(
      user._id.toString(),
      body.answers,
    );
  }
}
