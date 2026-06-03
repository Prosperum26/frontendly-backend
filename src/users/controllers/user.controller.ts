import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';

import { MyProfileResponse } from '../dtos';
import { UserService } from '../services';
import { ReqUser } from '@/auth/decorators';

interface UserProfilePayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  userTitle: string;
  avatarUrl: string;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  public myProfile(@ReqUser() authUser: Express.AuthenticatedHttpUser): {
    data: UserProfilePayload;
  } {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!authUser?.profile) {
      return {
        data: {
          name: 'Guest User',
          userTitle: 'Frontend Learner',
          avatarUrl: '',
        },
      };
    }
    const profile = new MyProfileResponse(authUser.profile);
    return {
      data: {
        ...profile,
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        userTitle: 'Frontend Learner',
      },
    };
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get XP / level / streak progress for the sidebar' })
  public async getProgress(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    return this.userService.getProgress(userId);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get earned badges for the sidebar' })
  public async getBadges(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    return this.userService.getBadges(userId);
  }

  private extractUserId(req: Request): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const user = req.user as
      | { profile?: { _id?: { toString(): string } } }
      | undefined;
    return user?.profile?._id?.toString() ?? 'dummy-user-001';
  }
}
