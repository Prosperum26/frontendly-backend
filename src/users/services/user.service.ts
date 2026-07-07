import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Express } from 'express';
import { Model, UpdateQuery } from 'mongoose';
import { Types } from 'mongoose';

import { GamificationService } from './gamification.service';
import { CloudinaryService } from '../../cloudinary.service';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User, getXpForLevel } from '../schemas';
import { ActivityLog } from '../schemas/activity-log.schema';
import {
  CreateOrUpdateUserResult,
  CreateUserOptions,
  createUserSchema,
} from '../types';
import { UserLearningProgressDocument } from '@/learning-path/db_schemas/learning_path_schemas';
import { MilestoneDocument } from '@/learning-path/db_schemas/milestone_schema';
import 'multer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,
    @InjectModel('UserLearningProgress')
    private userProgressModel: Model<UserLearningProgressDocument>,
    @InjectModel('Milestone')
    private milestoneModel: Model<MilestoneDocument>,
    private readonly gamificationService: GamificationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async createOrUpdateUser(
    options: CreateUserOptions,
  ): Promise<CreateOrUpdateUserResult> {
    await createUserSchema.parseAsync(options);
    const { email, googleId, firstName, lastName, picture } = options;

    const safeFirstName = firstName || 'User';
    const safeLastName = lastName || '';
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${safeFirstName}+${safeLastName}&background=e2e8f0&color=475569`;

    const update: UpdateQuery<User> = {
      $set: {
        googleId,
        firstName,
        lastName,
      },
      $setOnInsert: {
        avatarUrl: picture || defaultAvatarUrl,
      },
    };

    const res = await this.userModel.findOneAndUpdate({ email }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      includeResultMetadata: true,
      lean: true,
    });

    const formattedUser = {
      ...res.value,
      id: res.value!._id.toString(),
    };

    return {
      alreadyExists: !res.lastErrorObject?.upserted,
      user: <any>formattedUser,
    };
  }

  public async updateProfile(
    userId: string,
    body: UpdateProfileDto,
  ): Promise<{ message: string; user: any }> {
    if (body.phoneNumber) {
      const currentUser = await this.userModel
        .findById(userId)
        .select('phoneNumber lastPhoneUpdatedAt')
        .lean();

      if (currentUser && currentUser.phoneNumber !== body.phoneNumber) {
        if (currentUser.lastPhoneUpdatedAt) {
          const nextAllowedDate = new Date(currentUser.lastPhoneUpdatedAt);
          nextAllowedDate.setDate(nextAllowedDate.getDate() + 30);

          if (new Date() < nextAllowedDate) {
            throw new BadRequestException(
              'Chỉ được thay đổi số điện thoại 30 ngày/lần.',
            );
          }
        }
        Object.assign(body, { lastPhoneUpdatedAt: new Date() });
      }
    }

    if (body.username) {
      const existingUser = await this.userModel
        .findOne({
          username: body.username,
          _id: { $ne: userId },
        })
        .lean();

      if (existingUser) {
        throw new BadRequestException(
          'Username already exists, please choose another one.',
        );
      }
    }

    const updateData: Record<string, any> = { ...body };
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, lean: true },
      )
      .select(
        'username email firstName lastName fullName name avatar avatarUrl phoneNumber dateOfBirth bio lastPhoneUpdatedAt role',
      );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const formattedUser = {
      ...updatedUser,
      id: updatedUser._id.toString(),
    };

    this.logger.log(`Profile updated for user: ${userId}`);
    return {
      message: 'Profile updated successfully',
      user: <any>formattedUser,
    };
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = dto;

    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .lean<{ password?: string }>();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'This account does not have a password set. Please log in using your external provider (e.g., Google).',
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    this.logger.log(`Password changed for user: ${userId}`);
    return { message: 'Password changed successfully. Please log in again.' };
  }

  async getProgress(userId: string): Promise<{
    level: number;
    xp: number;
    xpToNextLevel: number;
    progressPercent: number;
    streak: number;
    maxStreak: number;
    rank: string;
  }> {
    try {
      const user = await this.userModel.findById(userId).lean();
      if (user) {
        const xpForNextLevel = getXpForLevel(user.level + 1);
        const xpInLevel = user.xp - getXpForLevel(user.level);
        const xpNeeded = xpForNextLevel - getXpForLevel(user.level);
        return {
          level: user.level,
          xp: xpInLevel,
          xpToNextLevel: xpNeeded,
          progressPercent:
            xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100,
          streak: user.stats?.streakDays || 0,
          maxStreak: user.stats?.maxStreakDays || 0,
          rank: '-',
        };
      }
    } catch (err) {
      this.logger.warn(`getProgress DB error for ${userId}: ${String(err)}`);
    }

    return {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      progressPercent: 0,
      streak: 0,
      maxStreak: 0,
      rank: '-',
    };
  }

  async getBadges(userId: string): Promise<{
    earned: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
      earnedAt: Date;
    }>;
    unearned: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
    }>;
  }> {
    try {
      const { earned, unearned } =
        await this.gamificationService.getUserBadges(userId);
      return {
        earned: earned.map(badge => ({
          id: String(badge._id),
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          earnedAt: badge.earnedAt,
        })),
        unearned: unearned.map(badge => ({
          id: String(badge._id),
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
        })),
      };
    } catch (err) {
      this.logger.warn(`getBadges DB error for ${userId}: ${String(err)}`);
      return { earned: [], unearned: [] };
    }
  }

  async getActivity(userId: string): Promise<any[]> {
    const activities = await this.activityLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    return activities.map(activity => ({
      ...activity,
      id: activity._id.toString(),
    }));
  }

  async logActivity(
    userId: string,
    type: any,
    description: string,
  ): Promise<void> {
    await this.activityLogModel.create({
      userId,
      type,
      description,
    });
  }

  async getLeaderboard(page: number = 1, limit: number = 50): Promise<any[]> {
    const skip = (page - 1) * limit;
    const topUsers = await this.userModel
      .find({ isDeleted: { $ne: true }, isBanned: { $ne: true } })
      .sort({ xp: -1, _id: 1 }) // _id to handle ties
      .skip(skip)
      .limit(limit)
      .select('name firstName lastName avatarUrl xp level')
      .lean();

    return topUsers.map((user, index) => {
      return {
        id: user._id.toString(),
        rank: skip + index + 1,
        username: user.name || user.firstName || 'Unknown',
        avatar: user.avatarUrl,
        level: user.level,
        xp: user.xp,
      };
    });
  }

  async getUserRank(userId: string | Record<string, unknown>): Promise<number> {
    // Handle case where userId might be an object
    const userIdStr = typeof userId === 'string' ? userId : String(userId);
    const user = await this.userModel.findById(userIdStr).select('xp').lean();
    if (!user) return -1;

    const count = await this.userModel.countDocuments({
      isDeleted: { $ne: true },
      isBanned: { $ne: true },
      $or: [
        { xp: { $gt: user.xp } },
        { xp: user.xp, _id: { $lt: new Types.ObjectId(userIdStr) } },
      ],
    });

    return count + 1;
  }

  public async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('Image file not found');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file);
    const realAvatarUrl = uploadResult.secure_url;

    await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { avatarUrl: realAvatarUrl } },
      { new: true },
    );

    return {
      message: 'Avatar updated successfully',
      avatarUrl: realAvatarUrl,
    };
  }

  async getActivityStats(userId: string) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const stats = await this.activityLogModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);

    return stats;
  }

  async getLearningProgress(userId: string) {
    try {
      const userProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (!userProgress) {
        return {
          totalLessons: 0,
          completedLessons: 0,
          completionPercentage: 0,
          currentMilestone: 'Starting your journey',
          isUnlocked: false,
        };
      }

      // Get all milestones to calculate total stages
      const milestones = await this.milestoneModel.find().lean();
      const totalStages = milestones.reduce(
        (sum, m) => sum + m.stages.length,
        0,
      );

      // Count completed stages (earnedStars >= 3)
      const completedStages = userProgress.unlockedStages.filter(
        s => s.earnedStars >= 3,
      ).length;

      const completionPercentage =
        totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

      // Get current milestone name from lastActiveMilestoneId
      let currentMilestone = 'Starting your journey';
      if (userProgress.lastActiveMilestoneId) {
        const activeMilestone = milestones.find(
          m => m.id === userProgress.lastActiveMilestoneId,
        );
        if (activeMilestone) {
          currentMilestone = activeMilestone.title;
        }
      }

      const isUnlocked = userProgress.unlockedStages.length > 0;

      return {
        totalLessons: totalStages,
        completedLessons: completedStages,
        completionPercentage,
        currentMilestone,
        isUnlocked,
      };
    } catch (err) {
      this.logger.warn(
        `getLearningProgress error for ${userId}: ${String(err)}`,
      );
      return {
        totalLessons: 0,
        completedLessons: 0,
        completionPercentage: 0,
        currentMilestone: '-',
        isUnlocked: false,
      };
    }
  }
}
