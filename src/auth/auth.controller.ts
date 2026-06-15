import {
  Body,
  Controller,
  CustomDecorator,
  Get,
  HttpCode,
  HttpStatus,
  Post, // Thêm Patch để hỗ trợ API cập nhật
  Req,
  SetMetadata,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { CustomDecoratorKey } from '@/common/constants';
// Import DTO cấu hình dữ liệu Profile

// Sửa lại chìa khóa: Gắn đúng từ khóa AUTH_OPTION và truyền { skipAuth: true }
export const Public = (): CustomDecorator =>
  SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true });

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // Đã có chìa khóa chuẩn, API này sẽ cho qua
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto): Promise<{ message: string }> {
    const result = await this.authService.register(body);
    return result;
  }

  @Public() // Đã có chìa khóa chuẩn
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    const result = await this.authService.login(body, res);
    return result;
  }

  @Public() // Đã có chìa khóa chuẩn
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const result = await this.authService.refreshToken(body, res);
    return result;
  }

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const result = await this.authService.forgotPassword(body);
    return result;
  }

  @SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true })
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const result = await this.authService.resetPassword(body);
    return result;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: any): Promise<{ message: string; data: any }> {
    // Thêm async và Promise
    const userId = <string>(req.user?._id || req.user?.id); // Lấy ID từ token

    // Yêu cầu AuthService chọc xuống DB lấy User mới nhất
    // Sửa đoạn gọi trong hàm getMe
    await (<any>this.authService).getFreshUser(userId);
    return {
      message: 'Profile retrieved successfully',
      data: req.user,
    };
  }
}
