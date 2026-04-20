/* eslint-disable new-cap */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

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

  /**
   * Create a new user. If that user already exists, update the existing user
   * (uniqueness is determined by email).
   */
  public async createOrUpdateUser(
    options: CreateUserOptions,
  ): Promise<CreateOrUpdateUserResult> {
    await createUserSchema.parseAsync(options);
    const { email, googleId, firstName, lastName, picture } = options;
    // Update user information in case it doesn't already exist
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
}
