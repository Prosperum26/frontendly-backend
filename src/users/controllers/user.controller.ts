import { Controller, Get, Body, Patch } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation } from '@nestjs/swagger';
import { Model } from 'mongoose';

import { MyProfileResponse } from '../dtos';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../schemas';
import { Badge } from '../schemas/badge.schema';
import { UserService } from '../services';
import { ReqUser } from '@/auth/decorators';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return new MyProfileResponse(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  public async updateProfile(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
    @Body() body: UpdateProfileDto,
  ): Promise<{ message: string; user: User }> {
    const profile = <Record<string, string>>(<unknown>authUser.profile);
    return this.userService.updateProfile(String(profile._id), body);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  public async changePassword(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
    @Body() body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const profile = <Record<string, string>>(<unknown>authUser.profile);
    return this.userService.changePassword(String(profile._id), body);
  }
}
