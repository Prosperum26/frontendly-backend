import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserService } from '../services';

@ApiTags('Leaderboard')
@Controller({
  path: 'leaderboard',
  version: '1',
})
export class LeaderboardController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get global leaderboard' })
  async getLeaderboard(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const data = await this.userService.getLeaderboard(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return { success: true, data };
  }

  @Get(':userId/rank')
  @ApiOperation({ summary: 'Get rank of a specific user' })
  async getUserRank(@Param('userId') userId: string) {
    const rank = await this.userService.getUserRank(userId);
    return { success: true, data: { rank } };
  }
}
