import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { MyProfileResponse } from '../dtos';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../schemas';
import { UserService } from '../services';
import { ReqUser } from '@/auth/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  public myProfile(
    @ReqUser() authUser: Express.AuthenticatedHttpUser,
  ): MyProfileResponse {
    return new MyProfileResponse(<User>(<unknown>authUser.profile));
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
