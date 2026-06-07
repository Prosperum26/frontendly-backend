/* eslint-disable new-cap */
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
import { UserLearningProgressDocument } from '@/learning-path/db_schemas/learning_path_schemas';
import { MilestoneDocument } from '@/learning-path/db_schemas/milestone_schema';

const XP_PER_LEVEL = 500;

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel('UserLearningProgress')
    private userProgressModel: Model<UserLearningProgressDocument>,
    @InjectModel('Milestone')
    private milestoneModel: Model<MilestoneDocument>,
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

  async getProgress(userId: string): Promise<{
    level: number;
    xp: number;
    xpToNextLevel: number;
    progressPercent: number;
    streak: number;
    rank: string;
  }> {
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (dbProgress) {
        const totalXp = dbProgress.currentXp;
        const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
        const xpInLevel = totalXp % XP_PER_LEVEL;
        return {
          level,
          xp: xpInLevel,
          xpToNextLevel: XP_PER_LEVEL,
          progressPercent: Math.round((xpInLevel / XP_PER_LEVEL) * 100),
          streak: dbProgress.streakDays,
          rank: '-',
        };
      }
    } catch (err) {
      this.logger.warn(`getProgress DB error for ${userId}: ${String(err)}`);
    }

    return {
      level: 1,
      xp: 0,
      xpToNextLevel: XP_PER_LEVEL,
      progressPercent: 0,
      streak: 0,
      rank: '-',
    };
  }

  async getBadges(userId: string): Promise<{
    badges: Array<{
      id: string;
      name: string;
      icon: string;
      isUnlocked: boolean;
    }>;
  }> {
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (dbProgress && dbProgress.badges.length > 0) {
        const earnedIds = <string[]>dbProgress.badges;

        const milestones = await this.milestoneModel
          .find({ 'stages.id': { $in: earnedIds } })
          .lean();

        const stageInfo = new Map<string, { title: string; icon: string }>();
        for (const m of milestones) {
          for (const s of m.stages) {
            if (earnedIds.includes(<string>s.id)) {
              stageInfo.set(<string>s.id, {
                title: s.title,
                icon:
                  (<{ icon?: string }>s).icon ||
                  (<{ icon?: string }>m).icon ||
                  '',
              });
            }
          }
        }

        return {
          badges: earnedIds.map(id => ({
            id,
            name: stageInfo.get(id)?.title ?? id,
            icon: stageInfo.get(id)?.icon ?? '',
            isUnlocked: true,
          })),
        };
      }
    } catch (err) {
      this.logger.warn(`getBadges DB error for ${userId}: ${String(err)}`);
    }

    return { badges: [] };
  }
}
