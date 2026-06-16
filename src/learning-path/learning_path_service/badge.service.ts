import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  UserLearningProgressDocument,
  EarnedBadge,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';
import {
  BadgeUnlockType,
  type BadgeUnlockCondition,
} from '@/users/schemas/badge.schema';
import { User } from '@/users/schemas/user.schema';

interface BadgeDoc {
  _id: { toString(): string };
  name: string;
  icon: string;
  description: string;
  category: string;
  unlockCondition: BadgeUnlockCondition;
}

@Injectable()
export class BadgeService {
  private readonly logger: Logger = new Logger(BadgeService.name);

  constructor(
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Badge')
    private readonly badgeModel: Model<BadgeDoc>,
  ) {}

  /**
   * Evaluate all badge conditions against a user's current progress.
   * Called after: stage completion, exercise submission, streak update, milestone completion.
   * Returns newly earned badges (for FE toast/notification).
   */
  async evaluateAndGrantBadges(
    userId: string,
    skillId: string,
  ): Promise<EarnedBadge[]> {
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      if (!dbProgress) {
        return [];
      }

      const allBadges = await this.badgeModel.find().lean();
      const alreadyEarnedIds = new Set(
        dbProgress.earnedBadges.map(b => b.badgeId),
      );

      const newlyEarned: EarnedBadge[] = [];

      for (const badge of allBadges) {
        const badgeId = badge._id.toString();
        if (alreadyEarnedIds.has(badgeId)) {
          continue;
        }

        const conditionMet = this.checkCondition(
          badge.unlockCondition,
          dbProgress,
        );

        if (conditionMet) {
          const earned: EarnedBadge = {
            badgeId,
            name: badge.name,
            icon: badge.icon,
            earnedAt: new Date(),
          };
          newlyEarned.push(earned);
        }
      }

      if (newlyEarned.length > 0) {
        await this.userProgressModel.updateOne(
          { userId, skillId },
          {
            $push: {
              earnedBadges: { $each: newlyEarned },
            },
          },
        );

        this.logger.log(
          `Awarded ${newlyEarned.length} badge(s) to user ${userId}: ${newlyEarned.map(b => b.name).join(', ')}`,
        );
      }

      return newlyEarned;
    } catch (error) {
      this.logger.warn(`Error evaluating badges: ${String(error)}`);
      return [];
    }
  }

  /**
   * Sync earned badges from UserLearningProgress to User.badges array.
   * Called after new badges are awarded. Skips badges already present on the
   * profile so badges granted via GamificationService aren't duplicated.
   */
  async syncBadgesToUserProfile(
    userId: string,
    newBadges: EarnedBadge[],
    userModel: Model<User>,
  ): Promise<void> {
    if (newBadges.length === 0) return;

    try {
      const user = await userModel.findById(userId).select('badges').lean();
      const existingIds = new Set(
        (user?.badges ?? []).map(b => b.badgeId.toString()),
      );

      const badgesToPush = newBadges
        .filter(b => !existingIds.has(b.badgeId))
        .map(b => ({
          badgeId: new Types.ObjectId(b.badgeId),
          earnedAt: b.earnedAt,
        }));

      if (badgesToPush.length === 0) return;

      await userModel.updateOne(
        { _id: userId },
        { $push: { badges: { $each: badgesToPush } } },
      );
    } catch (error) {
      this.logger.warn(`Error syncing badges to profile: ${String(error)}`);
    }
  }

  /**
   * Find the badge granted for completing a specific milestone, if one exists.
   * Used to populate CompletedMilestone.badgeId before evaluateAndGrantBadges runs.
   */
  async findMilestoneBadgeId(milestoneId: string): Promise<string> {
    try {
      const badge = await this.badgeModel
        .findOne({
          'unlockCondition.type': BadgeUnlockType.MILESTONE_COMPLETED,
          'unlockCondition.milestoneId': milestoneId,
        })
        .lean();

      return badge ? badge._id.toString() : '';
    } catch (error) {
      this.logger.warn(`Error finding milestone badge: ${String(error)}`);
      return '';
    }
  }

  /**
   * Check if a single badge unlock condition is met.
   */
  private checkCondition(
    condition: BadgeUnlockCondition,
    progress: {
      currentXp: number;
      streakDays: number;
      totalCompletedStages: number;
      completedMilestones: Array<{ milestoneId: string }>;
    },
  ): boolean {
    switch (condition.type) {
      case BadgeUnlockType.XP_AMOUNT:
        return progress.currentXp >= condition.value;

      case BadgeUnlockType.STREAK_DAYS:
        return progress.streakDays >= condition.value;

      case BadgeUnlockType.STAGES_COMPLETED:
        return progress.totalCompletedStages >= condition.value;

      case BadgeUnlockType.MILESTONE_COMPLETED:
        if (condition.milestoneId) {
          // Specific milestone check
          return progress.completedMilestones.some(
            cm => cm.milestoneId === condition.milestoneId,
          );
        }
        // Generic count check (e.g., "complete 3 milestones")
        return progress.completedMilestones.length >= condition.value;

      case BadgeUnlockType.SPECIAL_ACTION:
        // Special actions are handled externally
        return false;

      default:
        return false;
    }
  }
}
