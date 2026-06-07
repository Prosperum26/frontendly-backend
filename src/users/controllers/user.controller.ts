import {
  Controller,
  Get,
  Body,
  Patch,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Model } from 'mongoose';

import { MyProfileResponse } from '../dtos';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../schemas';
import { Badge } from '../schemas/badge.schema';
import { UserService } from '../services';
import { ConfigureAuth, ReqUser } from '@/auth/decorators';

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
    const user = await this.userModel
      .findById(authUser.userId)
      .populate<{ badges: Array<{ badgeId: Badge; earnedAt: Date }> }>({
        path: 'badges.badgeId',
        model: Badge.name,
      })
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new MyProfileResponse(<User>(<unknown>user));
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

  @Get('progress')
  @ConfigureAuth({ blockIfUnauthenticated: false })
  @ApiOperation({ summary: 'Get XP / level / streak progress for the sidebar' })
  public async getProgress(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    return this.userService.getProgress(userId);
  }

  @Get('badges')
  @ConfigureAuth({ blockIfUnauthenticated: false })
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
