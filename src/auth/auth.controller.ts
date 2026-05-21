import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
  ): Promise<{ message: string; token: string }> {
    return this.authService.login(body);
  }
}
