import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';

import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenService } from './services/token.service';
import { User } from '@/users/schemas';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
  ) { }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const { email, password, name } = dto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    this.logger.log(`User registered successfully: ${email}`);
    return { message: 'Đăng ký thành công' };
  }

  async login(dto: LoginDto): Promise<{ message: string; token: string }> {
    const { email, password } = dto;

    // Find user with password field
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .lean();

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Create access token
    const tokenDoc = await this.tokenService.create(user._id);
    const token = await this.tokenService.signAccessToken(tokenDoc);

    this.logger.log(`User logged in successfully: ${email}`);
    return { message: 'Đăng nhập thành công', token };
  }

  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<{ message: string; token: string }> {
    try {
      // Decode and validate the refresh token
      const { tokenId } = await this.tokenService.decodeAccessToken(dto.refreshToken);

      // Check if old token is still valid
      const oldToken = await this.tokenService.findAndValidateToken(
        new Types.ObjectId(tokenId),
      );
      if (!oldToken) {
        throw new UnauthorizedException('Token đã hết hạn hoặc bị vô hiệu hóa');
      }

      // Create new token
      const newTokenDoc = await this.tokenService.create(oldToken.userId);
      const newToken = await this.tokenService.signAccessToken(newTokenDoc);

      this.logger.log('Token refreshed successfully');
      return { message: 'Refresh token thành công', token: newToken };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
