import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ChallengeService } from './challenge.service';

@ApiTags('Challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('exercises')
  async getChallenges() {
    return this.challengeService.getChallenges();
  }

  @Get('exercises/:id')
  async getChallengeById(@Param('id') id: string) {
    return this.challengeService.getChallengeById(id);
  }
}
