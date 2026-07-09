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

import { ConfigureAuth } from '../decorators';
import { TokenService } from '../services';

@ApiTags('Authentication')
@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: true })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  public async refreshToken(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    // Get refreshToken from HttpOnly cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token found in cookie');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.tokenService.refreshAccessToken(refreshToken, res);
    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
