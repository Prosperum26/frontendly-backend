import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

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
  ): Promise<GoogleLoginResponseDto> {
    const { accessToken } = await this.googleAuthService.authenticate(
      dto.idToken,
    );
    return new GoogleLoginResponseDto(accessToken);
  }
}
