import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ActivityLog, ActivityType } from '../schemas/activity-log.schema';
import { Badge, BadgeUnlockType } from '../schemas/badge.schema';
import { User, getXpForLevel } from '../schemas/user.schema';

const XP_VALUES: Record<ActivityType, number> = {
  [ActivityType.STAGE_COMPLETED]: 50,
  [ActivityType.LESSON_COMPLETED]: 25,
  [ActivityType.DAILY_LOGIN]: 10,
  [ActivityType.CHALLENGE_WON]: 100,
  [ActivityType.STREAK_ACHIEVED]: 50,
  [ActivityType.BADGE_EARNED]: 75,
};

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Badge.name) private readonly badgeModel: Model<Badge>,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLog>,
  ) {}

  /**
   * Calculate the level based on total XP
   */
  calculateLevel(xp: number): number {
    let level = 1;
    while (getXpForLevel(level + 1) <= xp) {
      level++;
    }
    return level;
  }

  /**
   * Add XP to user, handle level-up, return new level and XP progress
   */
  async addXp(
    userId: string | Types.ObjectId,
    activityType: ActivityType,
    activityId?: string,
  ): Promise<{ newLevel: number; xpEarned: number; leveledUp: boolean }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const xpEarned = XP_VALUES[activityType];

    // Check for duplicate activity (if activityId is provided)
    if (activityId) {
      const existing = await this.activityLogModel.findOne({
        userId: user._id.toString(),
        type: activityType,
        description: activityId,
      });
      if (existing) {
        return {
          newLevel: user.level,
          xpEarned: 0,
          leveledUp: false,
        };
      }
    }

    // Add XP and update user
    const oldLevel = user.level;
    user.xp += xpEarned;
    const newLevel = this.calculateLevel(user.xp);
    user.level = newLevel;

    await user.save();

    // Log activity
    await this.logActivity(
      userId,
      activityType,
      activityId || `XP +${xpEarned}`,
    );

    await this.checkAndUnlockBadges(user._id.toString());

    return {
      newLevel,
      xpEarned,
      leveledUp: newLevel > oldLevel,
    };
  }

  /**
   * Update user's streak based on current date
   */
  async updateStreak(userId: string | Types.ObjectId): Promise<{
    currentStreak: number;
    maxStreak: number;
    streakMaintained: boolean;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // THÊM: Đảm bảo object stats tồn tại để tránh lỗi 'Cannot read properties of undefined'
    if (!user.stats) {
      user.stats = { streakDays: 0, maxStreakDays: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastActiveAt = user.stats.lastActiveAt
      ? new Date(user.stats.lastActiveAt)
      : null;
    lastActiveAt?.setHours(0, 0, 0, 0);

    let currentStreak = user.stats.streakDays || 0;
    let streakMaintained = false;

    if (!lastActiveAt || lastActiveAt < yesterday) {
      // Bỏ lỡ ngày, reset chuỗi
      currentStreak = 1;
    } else if (lastActiveAt.getTime() === yesterday.getTime()) {
      // Hôm qua có học, tăng chuỗi
      currentStreak += 1;
      streakMaintained = true;
    } else if (lastActiveAt.getTime() === today.getTime()) {
      // THÊM: Hôm nay đã tính streak rồi, giữ nguyên chuỗi
      streakMaintained = true;
    }

    // Cập nhật dữ liệu
    user.stats.streakDays = currentStreak;
    user.stats.lastActiveAt = new Date();

    // THÊM: Khởi tạo an toàn cho maxStreakDays
    if (!user.stats.maxStreakDays) {
      user.stats.maxStreakDays = 0;
    }

    if (currentStreak > user.stats.maxStreakDays) {
      user.stats.maxStreakDays = currentStreak;
    }

    // Cập nhật Heatmap
    user.activity_heatmap = user.activity_heatmap || {};
    const todayKey = today.toISOString().split('T')[0];
    user.activity_heatmap[todayKey] =
      (user.activity_heatmap[todayKey] || 0) + 1;
    user.markModified('activity_heatmap');

    await user.save();

    // Log & Badges
    await this.logActivity(userId, ActivityType.DAILY_LOGIN);
    await this.checkAndUnlockBadges(user._id.toString());

    return {
      currentStreak,
      maxStreak: user.stats.maxStreakDays,
      streakMaintained,
    };
  }

  /**
   * Get all badges, grouped by category and whether they're unlocked
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  async getUserBadges(userId: string | Types.ObjectId): Promise<{
    earned: Array<Badge & { earnedAt: Date }>;
    unearned: Badge[];
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const allBadges = await this.badgeModel.find().exec();

    const earned: Array<Badge & { earnedAt: Date }> = [];
    const unearned: Badge[] = [];

    allBadges.forEach(badge => {
      const earnedEntry = user.badges.find(
        b => b.badgeId.toString() === badge._id.toString(),
      );
      if (earnedEntry) {
        const badgeObj = badge.toObject();
        earned.push(<Badge & { earnedAt: Date }>(<unknown>{
          ...badgeObj,
          earnedAt: earnedEntry.earnedAt,
        }));
      } else {
        unearned.push(<Badge>(<unknown>badge.toObject()));
      }
    });

    return { earned, unearned };
  }

  /**
   * Check and unlock any badges the user qualifies for
   */
  async checkAndUnlockBadges(userId: string): Promise<Badge[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const allBadges = await this.badgeModel.find().exec();
    const unlockedBadges: Badge[] = [];

    const earnedBadgeIds = new Set(user.badges.map(b => b.badgeId.toString()));

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge._id.toString())) continue;

      let shouldUnlock = false;

      switch (badge.unlockCondition.type) {
        case BadgeUnlockType.XP_AMOUNT:
          shouldUnlock = user.xp >= badge.unlockCondition.value;
          break;
        case BadgeUnlockType.STREAK_DAYS:
          shouldUnlock =
            (user.stats.streakDays || 0) >= badge.unlockCondition.value;
          break;
        case BadgeUnlockType.STAGES_COMPLETED:
          shouldUnlock =
            (user.stage_progress.completedStages?.length || 0) >=
            badge.unlockCondition.value;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        user.badges.push({
          badgeId: badge._id,
          earnedAt: new Date(),
        });
        unlockedBadges.push(badge);
        await this.logActivity(
          userId,
          ActivityType.BADGE_EARNED,
          badge._id.toString(),
        );
      }
    }

    await user.save();

    return unlockedBadges;
  }

  /**
   * Log an activity for the user
   */
  async logActivity(
    userId: string | Types.ObjectId,
    type: ActivityType,
    description?: string,
  ): Promise<ActivityLog> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.activityLogModel.create({
      userId: user._id.toString(),
      type: type,
      description: description || type,
    });
  }
  /**
   * Check and handle daily login: add XP, update streak, check if already logged in today
   */
  async dailyCheckIn(userId: string | Types.ObjectId): Promise<{
    checkedIn: boolean;
    xpEarned: number;
    currentStreak: number;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const lastDailyLogin = user.lastDailyLogin
      ? new Date(user.lastDailyLogin)
      : null;
    lastDailyLogin?.setHours(0, 0, 0, 0);

    if (lastDailyLogin?.getTime() === today.getTime()) {
      // Already checked in today
      return {
        checkedIn: false,
        xpEarned: 0,
        currentStreak: user.stats?.streakDays || 0,
      };
    }

    // Add daily login XP
    const xpResult = await this.addXp(userId, ActivityType.DAILY_LOGIN);

    // Update streak
    const streakResult = await this.updateStreak(userId);

    // Update lastDailyLogin
    user.lastDailyLogin = new Date();
    await user.save();

    return {
      checkedIn: true,
      xpEarned: xpResult.xpEarned,
      currentStreak: streakResult.currentStreak,
    };
  }

  /**
   * Get user activity heatmap data for last N months
   */
  async getActivityHeatmap(
    userId: string | Types.ObjectId,
    months: number = 3, // Chỉnh mặc định thành 3 tháng cho khớp Frontend
  ): Promise<Array<{ date: string; count: number }>> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    const cutoffKey = cutoffDate.toISOString().split('T')[0];

    const filteredHeatmap: Record<string, number> = {};

    for (const [date, count] of Object.entries(user.activity_heatmap || {})) {
      if (date >= cutoffKey) {
        filteredHeatmap[date] = count;
      }
    }

    // CHUYỂN ĐỔI Object thành Array [{ date: '...', count: ... }]
    return Object.entries(filteredHeatmap).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
