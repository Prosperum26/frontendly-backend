import { Controller, Get } from '@nestjs/common';

import { ChallengeService } from './challenge.service';
import { ChallengeExercise } from './challenge.types';
import { ConfigureAuth } from '@/auth/decorators';

@ConfigureAuth({ blockIfUnauthenticated: false })
@Controller({ path: 'challenge', version: '1' })
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('exercises')
  getExercises(): ChallengeExercise[] {
    return this.challengeService.getExercises();
  }
}
