import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { Model, Types } from 'mongoose';

import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenService } from './services/token.service';
import { User } from '@/users/schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
  ) {}

  async register(body: RegisterDto): Promise<{ message: string }> {
    const { email, password, name } = body;
    const exist = await this.userModel.findOne({ email });
    if (exist) throw new BadRequestException('Email already exists');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const hashedPassword = await bcrypt.hash(<string>password, 10);

    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return { message: 'Registration successful' };
  }

  async login(
    body: LoginDto,
    res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const { email, password } = body;

    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .lean();

    const userDoc = <Record<string, string>>(<unknown>user);

    if (
      !user ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      !(await bcrypt.compare(<string>password, <string>userDoc.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenDoc = await this.tokenService.create(
      new Types.ObjectId(userDoc._id),
    );
    const accessToken = await this.tokenService.signAccessToken(tokenDoc);
    const { refreshToken, expiresAt } = await this.tokenService.createSession(
      new Types.ObjectId(userDoc._id),
      this.getDeviceInfo(res),
    );

    this.setRefreshCookie(res, refreshToken, expiresAt);

    return { message: 'Login successful', accessToken, refreshToken };
  }

  async refreshToken(
    body: RefreshTokenDto,
    res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } =
      await this.tokenService.refreshAccessToken(body.refreshToken, res);
    return { message: 'Token refresh successful', accessToken, refreshToken };
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
