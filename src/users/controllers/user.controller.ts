import {
  Controller,
  Get,
  Post,
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
import { UserService } from '../services';
import { GamificationService } from '../services/gamification.service';
import { ConfigureAuth, ReqUser } from '@/auth/decorators';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly gamificationService: GamificationService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  public async myProfile(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
  ): Promise<{ success: boolean; data: MyProfileResponse }> {
    const user = await this.userModel.findById(authUser.userId).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: new MyProfileResponse(<User>(<unknown>user)),
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  public async updateProfile(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
    @Body() body: UpdateProfileDto,
  ): Promise<{ success: boolean; message: string; data: User }> {
    const profile = <Record<string, string>>(<unknown>authUser.profile);
    const result = await this.userService.updateProfile(
      String(profile._id),
      body,
    );
    return {
      success: true,
      message: result.message,
      data: result.user,
    };
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
    const data = await this.userService.getProgress(userId);
    return { success: true, data };
  }

  @Get('badges')
  @ConfigureAuth({ blockIfUnauthenticated: false })
  @ApiOperation({ summary: 'Get earned badges for the sidebar' })
  public async getBadges(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    const data = await this.userService.getBadges(userId);
    return { success: true, data };
  }

  @Get('activity')
  @ConfigureAuth({ blockIfUnauthenticated: false })
  @ApiOperation({ summary: 'Get user activity logs' })
  public async getActivity(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    const data = await this.userService.getActivity(userId);
    return { success: true, data };
  }

  @Get('activity/stats')
  @ConfigureAuth({ blockIfUnauthenticated: false })
  @ApiOperation({ summary: 'Get user activity stats for heatmap' })
  public async getActivityStats(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    const data = await this.gamificationService.getActivityHeatmap(userId);
    return { success: true, data };
  }

  @Post('streak')
  @ConfigureAuth({ blockIfUnauthenticated: false })
  @ApiOperation({ summary: 'Update user streak for today' })
  public async updateStreak(@Req() req: Request): Promise<unknown> {
    const userId = this.extractUserId(req);
    const data = await this.gamificationService.updateStreak(userId);
    return { success: true, data };
  }

  private extractUserId(req: Request): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const user = req.user as
      | { profile?: { _id?: { toString(): string } } }
      | undefined;
    return user?.profile?._id?.toString() || '';
  }
}
