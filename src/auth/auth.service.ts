import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@/users/schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(body: RegisterDto): Promise<{ message: string }> {
    const { email, password, name } = body;
    const exist = await this.userModel.findOne({ email });
    if (exist) throw new BadRequestException('Email đã tồn tại');

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
      !(await bcrypt.compare(<string>password, <string>userDoc.password))
    ) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { id: userDoc._id, email: userDoc.email };
    const token = await this.jwtService.signAsync(payload);

    return { message: 'Đăng nhập thành công', token };
  }
}
