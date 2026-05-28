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
    if (exist) throw new BadRequestException('Email đã tồn tại');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const hashedPassword = await bcrypt.hash(<string>password, 10);

    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return { message: 'Đăng ký thành công' };
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
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokenDoc = await this.tokenService.create(
      new Types.ObjectId(userDoc._id),
    );
    const token = await this.tokenService.signAccessToken(tokenDoc);

    return { message: 'Đăng nhập thành công', token };
  }
}
