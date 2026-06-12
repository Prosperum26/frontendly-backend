import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ActivityLog } from '../schemas/activity-log.schema';
import { Badge, BadgeUnlockType } from '../schemas/badge.schema';
import { User, getXpForLevel } from '../schemas/user.schema';

export enum ActivityType {
  STAGE_COMPLETED = 'stage_completed',
  LESSON_COMPLETED = 'lesson_completed',
  DAILY_LOGIN = 'daily_login',
  CHALLENGE_WON = 'challenge_won',
  STREAK_ACHIEVED = 'streak_achieved',
  BADGE_EARNED = 'badge_earned',
}

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
      // User missed a day, reset streak
      currentStreak = 1;
    } else if (lastActiveAt.getTime() === yesterday.getTime()) {
      // User was active yesterday, continue streak
      currentStreak += 1;
      streakMaintained = true;
    }
    // If lastActiveAt is today, do nothing

    // Update user's streak data
    user.stats.streakDays = currentStreak;
    user.stats.lastActiveAt = new Date();
    if (currentStreak > (user.stats.maxStreakDays || 0)) {
      user.stats.maxStreakDays = currentStreak;
    }

    // Update activity heatmap
    const todayKey = today.toISOString().split('T')[0];
    user.activity_heatmap[todayKey] =
      (user.activity_heatmap[todayKey] || 0) + 1;

    await user.save();

    // Log daily activity
    await this.logActivity(userId, ActivityType.DAILY_LOGIN);

    await this.checkAndUnlockBadges(user._id.toString());

    return {
      currentStreak,
      maxStreak: user.stats.maxStreakDays || currentStreak,
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
        earned.push({
          ...badgeObj,
          earnedAt: earnedEntry.earnedAt,
        });
      } else {
        unearned.push(badge.toObject());
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
   * Get user activity heatmap data for last N months
   */
  async getActivityHeatmap(
    userId: string | Types.ObjectId,
    months: number = 12,
  ): Promise<Record<string, number>> {
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

    return filteredHeatmap;
  }
}
