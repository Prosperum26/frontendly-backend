import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  public async createOrUpdateUser(
    options: CreateUserOptions,
  ): Promise<CreateOrUpdateUserResult> {
    // Validate input data
    await createUserSchema.parseAsync(options);

    const { email, googleId, firstName, lastName, picture } = options;

    // Prepare update data
    const updateData: UpdateQuery<User> = {
      googleId,
      firstName,
      lastName,
      avatarUrl: picture,
    };

    // Find or create user
    const result = await this.userModel.findOneAndUpdate(
      { email },
      updateData,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: false,
        includeResultMetadata: true,
        lean: true,
      },
    );

    const isNewUser = !result.lastErrorObject?.updatedExisting;
    this.logger.log(`User ${isNewUser ? 'created' : 'updated'}: ${email}`);

    return {
      alreadyExists: result.lastErrorObject?.updatedExisting || false,
      user: result.value!,
    };
  }

  public async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ message: string; user: User }> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true, lean: true })
      .select('-password');

    if (!updatedUser) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    this.logger.log(`User profile updated: ${userId}`);
    return {
      message: 'Cập nhật thông tin thành công',
      user: updatedUser as User,
    };
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = dto;

    // Find user with password field
    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .lean();

    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    this.logger.log(`Password changed for user: ${userId}`);
    return { message: 'Đổi mật khẩu thành công' };
  }
}
