import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { MyProfileResponse } from '../dtos';
import { UserService } from '../services';
import { ReqUser } from '@/auth/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private extractUserId(req: Request): string {
    const user = req.user as
      | { profile?: { _id?: { toString(): string } } }
      | undefined;
    return user?.profile?._id?.toString() ?? 'dummy-user-001';
  }

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  public myProfile(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
  ): MyProfileResponse {
    if (!authUser?.profile) {
      return {
        email: 'guest@example.com',
        firstName: 'Guest',
        lastName: 'User',
        avatarUrl: '',
      };
    }
    return new MyProfileResponse(authUser.profile);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get XP / level / streak progress for the sidebar' })
  public async getProgress(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.userService.getProgress(userId);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get earned badges for the sidebar' })
  public async getBadges(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.userService.getBadges(userId);
  }
}
