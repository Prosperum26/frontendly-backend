/* eslint-disable new-cap */
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

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

    return {
      alreadyExists: res.lastErrorObject?.updatedExisting || false,
      user: res.value!,
    };
  }

  public async updateProfile(
    userId: string,
    body: UpdateProfileDto,
  ): Promise<{ message: string; user: User }> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: body },
        { new: true, lean: true }, // new: true ensures we get the updated document
      )
      .select('-password');

    if (!updatedUser) {
      // Changed to NotFoundException as it's standard for 404 resource not found
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile updated successfully',
      user: <User>(<unknown>updatedUser), // ✅ Dùng ngoặc nhọn theo chuẩn của máy bạn
    };
  }

  public async changePassword(
    userId: string,
    body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // We explicitly tell TS that this lean object might contain a password
    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .lean<{ password?: string }>();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Safety check: If user registered via Google, they might not have a password
    if (!user.password) {
      throw new BadRequestException(
        'This account does not have a password set. Please log in using your external provider (e.g., Google).',
      );
    }

    // Removed the ugly eslint-disable comments by using proper types
    const isMatch = await bcrypt.compare(body.oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);

    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    return { message: 'Password changed successfully' };
  }
}
