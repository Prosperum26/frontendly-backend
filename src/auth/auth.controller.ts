import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { ConfigureAuth } from './decorators';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) { }

  @ConfigureAuth({ skipAuth: true })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(body);
  }

  @ConfigureAuth({ skipAuth: true })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    const result = await this.authService.login(body, res);
    return result;
  }

  @ConfigureAuth({ skipAuth: true })
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const result = await this.authService.forgotPassword(body);
    return result;
  }

  @ConfigureAuth({ skipAuth: true })
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const result = await this.authService.resetPassword(body);
    return result;
  }

  @ConfigureAuth({ skipAuth: false })
  @Get('me')
  getProfile(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
  ): { message: string; user: Record<string, unknown> | undefined } {
    return {
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }
}
