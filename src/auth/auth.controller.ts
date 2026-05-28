// 1. THÊM SetMetadata vào danh sách import của @nestjs/common
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';

// 2. THÊM dòng import này để lấy cấu hình của dự án

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthGuard } from './guards/auth.guard';
import { CustomDecoratorKey } from '@/common/constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 3. THÊM cờ bỏ qua Guard ngay trên API register
  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(body);
  }

  // 4. THÊM cờ bỏ qua Guard ngay trên API login
  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('login')
  async login(
    @Body() body: LoginDto,
  ): Promise<{ message: string; token: string }> {
    return this.authService.login(body);
  }

  // API getProfile bên dưới GIỮ NGUYÊN
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
