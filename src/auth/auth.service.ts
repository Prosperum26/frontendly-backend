import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { Response } from 'express';
import { Model, Types } from 'mongoose';

import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { TokenService } from './services/token.service';
import { EmailService } from '@/common/email/email.service';
import { User } from '@/users/schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  async register(body: RegisterDto): Promise<{ message: string }> {
    try {
      const { email, password, name } = body;
      const exist = await this.userModel.findOne({ email });
      if (exist) throw new BadRequestException('Email đã tồn tại');

      const hashedPassword = await bcrypt.hash(<string>password, 10);

      // Tạo username mặc định từ email nếu không có
      const username = email.split('@')[0] + crypto.randomInt(100, 999);

      await this.userModel.create({
        name,
        email,
        username,
        password: hashedPassword,
      });

      return { message: 'Đăng ký thành công' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Đã xảy ra lỗi trong quá trình đăng ký: ${(<Error>error).message}`,
      );
    }
  }

  async login(
    body: LoginDto,
    res: Response,
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    const { email, password } = body;

    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .lean();

    const userDoc = <Record<string, any>>(<unknown>user);

    if (
      !user ||
      !(await bcrypt.compare(<string>password, <string>userDoc.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenDoc = await this.tokenService.create(
      <Types.ObjectId>userDoc._id,
    );
    const accessToken = await this.tokenService.signAccessToken(tokenDoc);
    const { refreshToken, expiresAt } = await this.tokenService.createSession(
      <Types.ObjectId>userDoc._id,
      this.getDeviceInfo(res),
    );

    this.setRefreshCookie(res, refreshToken, expiresAt);

    // Remove password and add id
    const userWithoutPassword = { ...userDoc };
    delete userWithoutPassword.password;
    const formattedUser = {
      ...userWithoutPassword,
      id: (<Types.ObjectId>userDoc._id).toString(),
    };

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: formattedUser,
    };
  }

  async refreshToken(
    body: RefreshTokenDto,
    res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } =
      await this.tokenService.refreshAccessToken(body.refreshToken, res);
    return { message: 'Token refresh successful', accessToken, refreshToken };
  }

  async forgotPassword(body: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email: body.email });
    if (!user) {
      return { message: 'Nếu email tồn tại, link reset sẽ được gửi.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Link reset mật khẩu đã được gửi qua email.' };
  }

  async resetPassword(body: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      resetPasswordToken: body.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Đổi mật khẩu thành công.' };
  }

  private getDeviceInfo(res: Response): string {
    const userAgent = res.req.headers['user-agent'];
    if (Array.isArray(userAgent)) return userAgent.join(', ');
    return userAgent || 'unknown';
  }

  private setRefreshCookie(
    res: Response,
    refreshToken: string,
    expiresAt: Date,
  ): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });
  }
}
