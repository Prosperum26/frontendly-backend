const XP_PER_LEVEL = 100; // Định nghĩa để hết lỗi Cannot find name
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
  private readonly logger: Logger = new Logger(UserService.name);

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

    // Generate a default avatar using the user's name (e.g., "John Doe" -> "JD")
    const safeFirstName = firstName || 'User';
    const safeLastName = lastName || '';
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${safeFirstName}+${safeLastName}&background=e2e8f0&color=475569`;

    const update: UpdateQuery<User> = {
      $set: {
        googleId,
        firstName,
        lastName,
        // Only update the avatar if a new picture is explicitly provided (e.g., Google sync)
        ...(picture && { avatarUrl: picture }),
      },
      $setOnInsert: {
        // If this is a brand NEW registration, assign the picture or the default avatar
        avatarUrl: picture || defaultAvatarUrl,
      },
    };

    const res = await this.userModel.findOneAndUpdate({ email }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true, // Ensured this is true to trigger schema defaults
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
    // --- BẮT ĐẦU ĐOẠN THÊM MỚI: Kiểm tra khóa 30 ngày đổi số điện thoại ---
    if (body.phoneNumber) {
      const currentUser = await this.userModel
        .findById(userId)
        .select('phoneNumber lastPhoneUpdatedAt')
        .lean();

      // Nếu user có gửi số điện thoại mới và số đó khác số cũ
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
        // Ghi nhận thời điểm đổi số mới nhất vào body để hàm $set bên dưới tự động lưu
        Object.assign(body, { lastPhoneUpdatedAt: new Date() });
      }
    }
    // --- KẾT THÚC ĐOẠN THÊM MỚI ---

    if (body.username) {
      const existingUser = await this.userModel
        .findOne({
          username: body.username,
          _id: { $ne: userId }, // Bỏ qua chính user hiện tại
        })
        .lean();

      if (existingUser) {
        throw new BadRequestException(
          'Username already exists, please choose another one.',
        );
      }
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: body },
        { new: true, lean: true }, // new: true ensures we get the updated document
      )
      .select(
        'username email firstName lastName fullName avatarUrl phoneNumber dateOfBirth bio lastPhoneUpdatedAt', // Đã THÊM lastPhoneUpdatedAt vào select để trả về FE
      );
    if (!updatedUser) {
      // Changed to NotFoundException as it's standard for 404 resource not found
      throw new NotFoundException('User not found');
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

    return { message: 'Đổi mật khẩu thành công' };
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
      return {
        id: p.userId,
        rank: skip + index + 1,
        username: user?.name || user?.firstName || 'Unknown',
        avatar: user?.avatarUrl,
        level: Math.floor(p.currentXp / XP_PER_LEVEL) + 1,
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
  // 👇 THÊM HÀM NÀY VÀO ĐỂ XỬ LÝ UPLOAD AVATAR

  public async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('Image file not found');
    }

    // Thực hiện upload thật lên Cloudinary
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

    // LƯU Ý: Thay "this.activityModel" bằng đúng Model đang lưu lịch sử bài học của bạn (ví dụ: lessonModel, userProgressModel...)
    // Và thay trường "createdAt" bằng trường thời gian tương ứng trong DB của bạn.
    const stats = await this.activityLogModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId), // hoặc tùy thuộc cách bạn lưu khóa ngoại
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
  // THÊM HÀM NÀY: Xây dựng API Progress Track theo đúng task
  async getLearningProgress(userId: string) {
    try {
      // 1. Lấy dữ liệu tiến độ của user do team Learning Path quản lý
      const userProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      // 2. Lấy tổng số bài học từ Milestone (hoặc để team Learning Path sửa lại query này cho đúng cấu trúc của họ)
      const totalLessons = await this.milestoneModel.countDocuments();

      // 3. Chuẩn bị 5 trường dữ liệu theo đúng yêu cầu
      // Lưu ý: Các field như completedLessonsCount hay currentMilestoneName phụ thuộc vào Schema của team Learning Path.
      const completedLessons = (<any>userProgress)?.completedLessonsCount || 0;

      const completionPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      const currentMilestone =
        (<any>userProgress)?.currentMilestoneName || 'Beginner';
      const isUnlocked = (<any>userProgress)?.isUnlocked ?? true;

      // Trả về đúng 5 trường
      return {
        totalLessons, // Tổng số bài học
        completedLessons, // Số bài hoàn thành
        completionPercentage, // Phần trăm hoàn thành
        currentMilestone, // Milestone hiện tại
        isUnlocked, // Trạng thái mở khóa
      };
    } catch (err) {
      this.logger.warn(
        `getLearningProgress error for ${userId}: ${String(err)}`,
      );
      // Trả về giá trị mặc định nếu lỗi
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
