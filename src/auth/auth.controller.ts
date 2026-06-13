import {
  Body,
  Controller,
  CustomDecorator,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch, // Thêm Patch để hỗ trợ API cập nhật
  Req,
  SetMetadata,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { CustomDecoratorKey } from '@/common/constants';
import { UpdateProfileDto } from '@/users/dtos/update-profile.dto'; // Import DTO cấu hình dữ liệu Profile

// Sửa lại chìa khóa: Gắn đúng từ khóa AUTH_OPTION và truyền { skipAuth: true }
export const Public = (): CustomDecorator =>
  SetMetadata(CustomDecoratorKey.AUTH_OPTION, { skipAuth: true });

@Controller('auth')
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
  ): Promise<{ message: string; token: string }> {
    const result = await this.authService.login(body);
    return result;
  }

  @Public() // Đã có chìa khóa chuẩn
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: RefreshTokenDto,
  ): Promise<{ message: string; token: string }> {
    const result = await this.authService.refreshToken(body);
    return result;
  }

  // KHÔNG dùng @Public() ở đây, vì API này BẮT BUỘC phải có token
  // Đã bỏ 'async' và thêm type ': { message: string; data: any }' để chuẩn ESLint
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: any): Promise<{ message: string; data: any }> {
    // Thêm async và Promise
    const userId = <string>(req.user?._id || req.user?.id); // Lấy ID từ token

    // Yêu cầu AuthService chọc xuống DB lấy User mới nhất
    // Sửa đoạn gọi trong hàm getMe
    const freshUser = await (<any>this.authService).getFreshUser(userId);
    return {
      message: 'Lấy thông tin thành công',
      data: freshUser, // Trả về data thật từ DB thay vì req.user
    };
  }

  // Mở cổng API Cập nhật Profile (Yêu cầu phải có Token)
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: any,
    @Body() body: UpdateProfileDto,
  ): Promise<{ message: string; user: any }> {
    // Lấy ID của user hiện tại từ token (Guard đã gắn vào req.user)
    // Sửa dòng khai báo userId thành như thế này:
    const userId = <string>(req.user?._id || req.user?.id); // Đẩy xuống Service xử lý lưu vào Database
    const result = await this.authService.updateProfile(userId, body);
    return result;
  }
}
