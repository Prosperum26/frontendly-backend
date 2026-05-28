import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthGuard } from './guards/auth.guard';
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
  ): Promise<{ message: string; token: string }> {
    return this.authService.login(body);
  }

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('refresh')
  async refresh(
    @Body() body: RefreshTokenDto,
  ): Promise<{ message: string; token: string }> {
    return this.authService.refreshToken(body);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
  ): { message: string; user: Record<string, unknown> | undefined } {
    return {
      message: 'Lấy thông tin cá nhân thành công',
      user: req.user?.profile,
    };
  }
}
