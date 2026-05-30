import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { ConfigureAuth } from '../decorators';
import { TokenService } from '../services';

@Controller('auth')
export class LogoutController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: false })
  @ApiOperation({ summary: 'Logout user and revoke session' })
  public async logout(
    @Body() body: { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.tokenService.revokeSession(body.refreshToken, res);
    return { message: 'Logged out successfully' };
  }
}
