import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

import { ConfigureAuth } from '../decorators';
import { TokenService } from '../services';

@Controller('auth')
export class LogoutController {
  constructor(private readonly tokenService: TokenService) { }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: false })
  @ApiOperation({ summary: 'Logout user and revoke session' })
  public async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Get refreshToken from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await this.tokenService.revokeSession(refreshToken, res);
    }
    return { message: 'Logged out successfully' };
  }
}
