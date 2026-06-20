import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

import { ConfigureAuth } from '../decorators';
import { GoogleLoginRequestDto, GoogleLoginResponseDto } from '../dtos';
import { GoogleAuthService } from '../services';
import { AuthConfig, authConfigObj } from '@/common/config';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
  ) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: true })
  @ApiOperation({ summary: 'Login using Google' })
  public async login(
    @Body() dto: GoogleLoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleLoginResponseDto> {
    const { accessToken, refreshToken, user, isNewUser } =
      await this.googleAuthService.authenticate(dto.idToken, res);

    return new GoogleLoginResponseDto(accessToken, user, refreshToken, isNewUser);
  }
}
