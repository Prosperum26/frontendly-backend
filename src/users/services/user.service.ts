import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, UpdateQuery } from 'mongoose';

import { GamificationService } from './gamification.service';
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
  ) { }

  public async createOrUpdateUser(
    options: CreateUserOptions,
  ): Promise<CreateOrUpdateUserResult> {
    // Validate input data
    await createUserSchema.parseAsync(options);

    const { email, googleId, firstName, lastName, picture } = options;

    // Check if user already exists with this email or googleId
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { googleId }],
    }).lean();

    // Prepare update data
    const updateData: UpdateQuery<User> = {
      googleId,
      firstName,
      lastName,
      avatarUrl: picture,
    };

    let userDoc;
    let isNewUser = false;

    if (existingUser) {
      // Update existing user
      userDoc = await this.userModel
        .findByIdAndUpdate(existingUser._id, updateData, {
          new: true,
          lean: true,
        })
        .lean();
      this.logger.log(
        `Updated existing user: ${email} (ID: ${existingUser._id})`,
      );
    } else {
      try {
        // Create new user using findOneAndUpdate with upsert to prevent race conditions
        userDoc = await this.userModel
          .findOneAndUpdate(
            { email },
            {
              email,
              googleId,
              firstName,
              lastName,
              avatarUrl: picture,
              name: `${firstName || ''} ${lastName || ''}`.trim() || email,
              username: email.split('@')[0],
            },
            {
              upsert: true,
              new: true,
              lean: true,
              setDefaultsOnInsert: true,
            },
          )
          .lean();

        // Check if this was actually a new user by comparing createdAt timestamps
        isNewUser = !existingUser;
        this.logger.log(
          `${isNewUser ? 'Created new user' : 'Updated existing user'}: ${email} (ID: ${userDoc?._id})`,
        );
      } catch (error: any) {
        // Handle duplicate key errors
        if (error.code === 11000) {
          this.logger.warn(`Duplicate user detected for email: ${email}, retrying...`);
          // Retry by fetching the existing user
          userDoc = await this.userModel.findOne({ email }).lean();
          isNewUser = false;
        } else {
          throw error;
        }
      }
    }

    const formattedUser = {
      ...userDoc,
      id: userDoc!._id.toString(),
    };

    return {
      alreadyExists: !isNewUser,
      user: <any>formattedUser,
    };
  }

  public async updateProfile(
    userId: string,
    body: UpdateProfileDto,
  ): Promise<{ message: string; user: any }> {
    try {
      // Check if user exists
      const user = await this.userModel.findById(userId).lean();
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      // Validate username uniqueness if username is being updated
      if (body.username && body.username !== user.username) {
        const existingUser = await this.userModel
          .findOne({ username: body.username })
          .lean();
        if (existingUser) {
          throw new BadRequestException('Username đã được sử dụng');
        }
      }

      // Build update object with only provided fields
      const updateData: Record<string, any> = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.firstName !== undefined) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;
      if (body.username !== undefined) updateData.username = body.username;
      if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
      if (body.role !== undefined) updateData.role = body.role;

      // Update user
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { $set: updateData }, { new: true, lean: true })
        .select('-password');

      if (!updatedUser) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      const formattedUser = {
        ...updatedUser,
        id: updatedUser._id.toString(),
      };

      this.logger.log(`Profile updated for user: ${userId}`);
      return {
        message: 'Cập nhật thông tin thành công',
        user: <any>formattedUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Profile update failed for user ${userId}: ${error.message}`);
      throw new BadRequestException('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    }
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = dto;

    try {
      // Validate that old and new passwords are different
      if (oldPassword === newPassword) {
        throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
      }

      // Find user with password field
      const user = await this.userModel
        .findById(userId)
        .select('+password')
        .lean();

      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      // Verify old password
      if (!user.password) {
        throw new BadRequestException('Người dùng chưa đặt mật khẩu');
      }
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
      return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Password change failed for user ${userId}: ${error.message}`);
      throw new BadRequestException('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
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
        const xpForCurrentLevel = getXpForLevel(user.level);
        const xpForNextLevel = getXpForLevel(user.level + 1);
        const xpInLevel = user.xp - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;
        return {
          level: user.level,
          xp: xpInLevel,
          xpToNextLevel: xpNeeded,
          progressPercent:
            xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100,
          streak: user.stats.streakDays || 0,
          maxStreak: user.stats.maxStreakDays || 0,
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
          id: badge._id.toString(),
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          earnedAt: badge.earnedAt,
        })),
        unearned: unearned.map(badge => ({
          id: badge._id.toString(),
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

  async getActivity(userId: string): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
  }

  async getActivityStats(
    userId: string,
  ): Promise<Array<{ date: string; count: number }>> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const stats = await this.activityLogModel.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
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
      { $sort: { date: 1 } },
    ]);

    return stats;
  }

  async logActivity(
    userId: string,
    type: 'lesson_completed' | 'challenge_won' | 'streak_achieved',
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
    const topUsers = await this.userProgressModel
      .find({})
      .sort({ currentXp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user details for these progress entries
    const userIds = topUsers.map(p => p.userId);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('name firstName lastName avatarUrl')
      .lean();

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return topUsers.map((p, index) => {
      const user = userMap.get(p.userId);
      // Calculate level from XP using the same logic as getXpForLevel
      let level = 1;
      let xpForCurrentLevel = 0;
      while (getXpForLevel(level + 1) <= p.currentXp) {
        level++;
      }
      return {
        id: p.userId,
        rank: skip + index + 1,
        username: user?.name || user?.firstName || 'Unknown',
        avatar: user?.avatarUrl,
        level,
        xp: p.currentXp,
      };
    });
  }

  async getUserRank(userId: string): Promise<number> {
    const userProgress = await this.userProgressModel
      .findOne({ userId })
      .lean();
    if (!userProgress) return -1;

    const count = await this.userProgressModel.countDocuments({
      currentXp: { $gt: userProgress.currentXp },
    });

    return count + 1;
  }
}
