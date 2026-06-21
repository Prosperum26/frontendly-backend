import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Types } from 'mongoose';

import { ConfigureAuth } from '../decorators';
import { TokenService } from '../services';

@ApiTags('Authentication')
@Controller('auth')
export class LogoutController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: false })
  @ApiOperation({ summary: 'Logout user and revoke current session' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async logout(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    try {
      const userId = req.user?.userId;

      // Get refreshToken from cookie or body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (refreshToken) {
        await this.tokenService.revokeSession(
          refreshToken,
          res,
          // eslint-disable-next-line sonarjs/deprecation
          new Types.ObjectId(userId),
        );
      } else {
        // Even if no refresh token, clear the cookie
        res.clearCookie('refreshToken');
      }

      return { message: 'Logged out successfully' };
    } catch {
      // Always clear cookie even if error occurs
      res.clearCookie('refreshToken');
      return { message: 'Logged out successfully' };
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: false })
  @ApiOperation({ summary: 'Logout user from all devices' })
  @ApiResponse({
    status: 200,
    description: 'Logged out from all devices successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async logoutAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    try {
      const userId = req.user?.userId;

      // Revoke all sessions for the user
      // eslint-disable-next-line sonarjs/deprecation
      await this.tokenService.revokeAllUserSessions(new Types.ObjectId(userId));

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return { message: 'Logged out from all devices successfully' };
    } catch {
      // Always clear cookie even if error occurs
      res.clearCookie('refreshToken');
      return { message: 'Logged out from all devices successfully' };
    }
  }
}
