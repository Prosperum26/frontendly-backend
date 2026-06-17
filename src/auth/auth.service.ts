import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Inject,
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
import { AuthConfig, authConfigObj } from '@/common/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
    private emailService: EmailService,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
  ) { }

  async register(body: RegisterDto): Promise<{ message: string }> {
    try {
      const { email, password, name } = body;
      const exist = await this.userModel.findOne({ email });
      if (exist) throw new BadRequestException('Email đã tồn tại');

      const hashedPassword = await bcrypt.hash(<string>password, this.authConfig.bcryptSaltRounds);

      // Tạo username mặc định từ email nếu không có
      const username = email.split('@')[0] + crypto.randomInt(100, 999);

      await this.userModel.create({
        name,
        email,
        username,
        password: hashedPassword,
      });

      this.logger.log(`New user registered: ${email}`);
      return { message: 'Đăng ký thành công' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Registration failed for ${body.email}: ${error.message}`);
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
    try {
      const { email, password, rememberMe = false } = body;

      // Find user with password field
      const user = await this.userModel
        .findOne({ email })
        .select('+password')
        .lean();

      const userDoc = <Record<string, any>>(<unknown>user);

      if (
        !user ||
        !(await bcrypt.compare(<string>password, <string>userDoc.password))
      ) {
        throw new UnauthorizedException('Invalid login credentials. Please check your email or password and try again.');
      }

      const tokenDoc = await this.tokenService.create(
        <Types.ObjectId>userDoc._id,
      );
      const accessToken = await this.tokenService.signAccessToken(tokenDoc);
      const { refreshToken, expiresAt } = await this.tokenService.createSession(
        <Types.ObjectId>userDoc._id,
        this.getDeviceInfo(res),
        rememberMe ? 30 : 7, // 30 days if remember me, else 7 days
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
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Login failed: ${error.message}`);
      throw new BadRequestException('Login failed. Please try again.');
    }
  }

  async refreshToken(
    body: RefreshTokenDto,
    res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    try {
      const { accessToken, refreshToken } =
        await this.tokenService.refreshAccessToken(body.refreshToken, res);
      return { message: 'Token refresh successful', accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`Refresh token failed: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(body: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findOne({ email: body.email });
      if (!user) {
        this.logger.warn(`Password reset requested for non-existent email: ${body.email}`);
        return { message: 'Nếu email tồn tại, link reset sẽ được gửi.' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + this.authConfig.passwordResetExpiresInMinutes * 60 * 1000);
      await user.save();

      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      this.logger.log(`Password reset email sent to: ${body.email}`);
      return { message: 'Link reset mật khẩu đã được gửi qua email.' };
    } catch (error) {
      this.logger.error(`Forgot password failed for ${body.email}: ${error.message}`);
      throw new BadRequestException('Gửi email reset mật khẩu thất bại. Vui lòng thử lại.');
    }
  }

  async resetPassword(body: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findOne({
        resetPasswordToken: body.token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        this.logger.warn(`Invalid or expired reset token attempted`);
        throw new BadRequestException('The password reset link is invalid or has expired. Please request a new link to continue.');
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, this.authConfig.bcryptSaltRounds);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Revoke all sessions when password is reset for security
      await this.tokenService.revokeAllUserSessions(user._id);

      this.logger.log(`Password reset successful for user: ${user.email}`);
      return { message: 'Đổi mật khẩu thành công. Tất cả phiên đăng nhập đã bị hủy.' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Reset password failed: ${error.message}`);
      throw new BadRequestException('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
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
