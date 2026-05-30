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
import { GoogleLoginRequestDto, GoogleLoginResponseDto } from '../dtos';
import { GoogleAuthService } from '../services';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ConfigureAuth({ skipAuth: true })
  @ApiOperation({ summary: 'Login using Google' })
  public async login(
    @Body() dto: GoogleLoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleLoginResponseDto> {
    const { accessToken, refreshToken } =
      await this.googleAuthService.authenticate(dto.idToken, res);
    return new GoogleLoginResponseDto(accessToken, refreshToken);
  }
}
