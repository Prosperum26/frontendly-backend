import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';

import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenService } from './services/token.service';
import { UpdateProfileDto } from '@/users/dtos/update-profile.dto';
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
    if (exist) throw new BadRequestException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);

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
      .lean<User>();

    if (!user?.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokenDoc = await this.tokenService.create(
      new Types.ObjectId(user._id),
    );
    const token = await this.tokenService.signAccessToken(tokenDoc);

    return { message: 'Đăng nhập thành công', token };
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
        throw new UnauthorizedException('Token đã hết hạn hoặc bị vô hiệu hóa');
      }

      const newTokenDoc = await this.tokenService.create(
        new Types.ObjectId(oldToken.userId),
      );
      const newToken = await this.tokenService.signAccessToken(newTokenDoc);

      return { message: 'Refresh token thành công', token: newToken };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  // Đã đưa hàm updateProfile vào đúng vị trí bên trong class AuthService
  // Sửa dòng 95 thành:
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ message: string; user: any }> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: dto },
        { new: true, runValidators: true }, // Trả về data mới & chạy validate của Mongoose
      )
      .select('-password'); // Loại bỏ password khỏi response bảo mật

    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return {
      message: 'Cập nhật tài khoản thành công',
      user: updatedUser,
    };
  }

  // Thêm hàm này vào auth.service.ts
  public async getFreshUser(userId: string): Promise<any> {
    // Tùy vào việc file auth.service của bạn đang Inject userModel hay userService.
    // Nếu bạn đang dùng userModel:
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();

    // (Hoặc nếu dùng userService thì: const user = await this.userService.findById(userId); )

    return user;
  }
}
