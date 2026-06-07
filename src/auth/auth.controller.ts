import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  SetMetadata,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { CustomDecoratorKey } from '@/common/constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(body);
  }

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
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

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('refresh')
  async refresh(
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const result = await this.authService.refreshToken(body, res);
    return result;
  }

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const result = await this.authService.forgotPassword(body);
    return result;
  }

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const result = await this.authService.resetPassword(body);
    return result;
  }

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
