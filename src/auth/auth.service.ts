import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as bcrypt from 'bcrypt';
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
    private jwtService: JwtService,
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

  async login(body: LoginDto): Promise<{ message: string; token: string }> {
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
    const token = await this.tokenService.signAccessToken(tokenDoc);

    return { message: 'Login successful', token };
  }

  async refreshToken(
    body: RefreshTokenDto,
  ): Promise<{ message: string; token: string }> {
    try {
      const { tokenId } = await this.tokenService.decodeAccessToken(
        body.refreshToken,
      );

      const oldToken = await this.tokenService.findAndValidateToken(
        new Types.ObjectId(tokenId),
      );
      if (!oldToken) {
        throw new UnauthorizedException('Token has expired or been revoked');
      }

      const newTokenDoc = await this.tokenService.create(
        new Types.ObjectId(oldToken.userId),
      );
      const newToken = await this.tokenService.signAccessToken(newTokenDoc);

      return { message: 'Token refresh successful', token: newToken };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
