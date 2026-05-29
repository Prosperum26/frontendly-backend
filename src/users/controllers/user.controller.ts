import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MyProfileResponse } from '../dtos';
import { UserService } from '../services';
import { ReqUser } from '@/auth/decorators';
import { User } from '../schemas';
import { Badge } from '../schemas/badge.schema';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  public async myProfile(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
  ): Promise<MyProfileResponse> {
    // Fetch user with populated badges for complete profile data
    const user = await this.userModel
      .findById(authUser.userId)
      .populate<{ badges: Array<{ badgeId: Badge; earnedAt: Date }> }>({
        path: 'badges.badgeId',
        model: Badge.name,
      })
      .lean();

    if (!user) {
      throw new Error('User not found');
    }

    return new MyProfileResponse(user as any);
  }
}
