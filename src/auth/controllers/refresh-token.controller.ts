import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

import { ConfigureAuth } from '../decorators';
import { TokenService } from '../services';

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: true })
  @ApiOperation({ summary: 'Refresh access token' })
  public async refreshToken(
    @Body() body: { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } =
      await this.tokenService.refreshAccessToken(body.refreshToken, res);
    return { accessToken, refreshToken };
  }
}
