import {
  Controller,
  Get,
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
export class SessionController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('sessions')
  @ConfigureAuth({ skipAuth: false })
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              device_info: { type: 'string' },
              expires_at: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getActiveSessions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
  ): Promise<{ sessions: any[] }> {
    const userId = req.user.userId;
    const sessions = await this.tokenService.getUserSessions(userId);
    return { sessions };
  }

  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: false })
  @ApiOperation({ summary: 'Revoke all active sessions for current user' })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async revokeAllSessions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.tokenService.revokeAllUserSessions(userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    return { message: 'All sessions revoked successfully' };
  }
}
