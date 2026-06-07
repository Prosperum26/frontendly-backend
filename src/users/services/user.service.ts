/* eslint-disable new-cap */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as bcrypt from 'bcrypt';
import { Model, UpdateQuery } from 'mongoose';

import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../schemas';
import {
  CreateOrUpdateUserResult,
  CreateUserOptions,
  createUserSchema,
} from '../types';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async createOrUpdateUser(
    options: CreateUserOptions,
  ): Promise<CreateOrUpdateUserResult> {
    await createUserSchema.parseAsync(options);
    const { email, googleId, firstName, lastName, picture } = options;
    const update: UpdateQuery<User> = {
      googleId,
      firstName,
      lastName,
      avatarUrl: picture,
    };
    const res = await this.userModel.findOneAndUpdate({ email }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: false,
      includeResultMetadata: true,
      lean: true,
    });

    const userDoc = res.value!;
    const formattedUser = {
      ...userDoc,
      id: userDoc._id.toString(),
    };

    return {
      alreadyExists: res.lastErrorObject?.updatedExisting || false,
      user: <any>formattedUser,
    };
  }

  public async updateProfile(
    userId: string,
    body: UpdateProfileDto,
  ): Promise<{ message: string; user: any }> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: body }, { new: true, lean: true })
      .select('-password');

    if (!updatedUser) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    const formattedUser = {
      ...updatedUser,
      id: updatedUser._id.toString(),
    };

    return {
      message: 'Cập nhật thông tin thành công',
      user: <any>formattedUser,
    };
  }

  public async changePassword(
    userId: string,
    body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .lean();

    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    const userDoc = <Record<string, string>>(<unknown>user);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const isMatch = await bcrypt.compare(
      <string>body.oldPassword,
      <string>userDoc.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const hashedNewPassword = await bcrypt.hash(<string>body.newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    return { message: 'Đổi mật khẩu thành công' };
  }
}
