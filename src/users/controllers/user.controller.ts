import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { MyProfileResponse } from '../dtos';
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
    // We assume that we're already authenticated, therefore it's safe to return
    // the user object directly
    return new MyProfileResponse(authUser.profile);
  }
}
