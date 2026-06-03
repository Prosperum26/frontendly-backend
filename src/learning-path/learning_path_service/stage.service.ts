import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserLearningProgressDocument } from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';
import {
  StageContextService,
  ProgressService,
  UserUtilsService,
} from '../services';

@Injectable()
export class StageService {
  private readonly logger: Logger = new Logger(StageService.name);

  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly stageContextService: StageContextService,
    private readonly progressService: ProgressService,
    private readonly userUtilsService: UserUtilsService,
  ) {}

  async completeStage(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<{
    stageId: string;
    streakIncremented: boolean;
    newStreakDays: number;
    badgeEarned: { stageId: string; icon: string } | null;
    isStageComplete: boolean;
  }> {
    const { milestoneId } =
      await this.stageContextService.findStageContext(stageId);

    // Skip saving progress for guest users
    if (this.userUtilsService.isGuestUser(userId)) {
      this.logger.debug(
        `Guest user ${userId} - skipping stage completion save`,
      );
      return {
        stageId,
        streakIncremented: false,
        newStreakDays: 0,
        badgeEarned: null,
        isStageComplete: false,
      };
    }

    let badgeIcon = '';
    if (milestoneId) {
      const parentMilestone = await this.milestoneModel
        .findOne({ id: milestoneId })
        .lean();
      if (parentMilestone) {
        const stageDoc = parentMilestone.stages.find(s => s.id === stageId);
        badgeIcon =
          (<{ icon?: string }>stageDoc).icon ||
          (<{ icon?: string }>parentMilestone).icon ||
          '';
      }
    }

    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();
      if (!dbProgress) {
        throw new Error('User progress not found');
      }

      const stageEntry = dbProgress.unlockedStages.find(
        s => s.stageId === stageId,
      );
      const currentStars = stageEntry?.earnedStars ?? 0;
      const newStars = Math.max(currentStars, 3);
      const isStageComplete = newStars >= 3;
      const alreadyBadged = !!stageEntry?.badgeEarned;

      const streakIncremented = this.progressService.shouldIncrementStreak(
        dbProgress.lastStreakDate,
      );
      const newStreakDays = streakIncremented
        ? dbProgress.streakDays + 1
        : dbProgress.streakDays;

      const awardBadge = isStageComplete && !alreadyBadged;

      const topLevelSet: Record<string, unknown> = {
        lastActiveStageId: stageId,
        ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
        ...(streakIncremented && {
          streakDays: newStreakDays,
          lastStreakDate: this.progressService.getTodayString(),
        }),
      };

      if (stageEntry) {
        await this.userProgressModel.updateOne(
          { userId, 'unlockedStages.stageId': stageId },
          {
            $set: {
              ...topLevelSet,
              'unlockedStages.$.earnedStars': newStars,
              'unlockedStages.$.isPracticeUnlocked': true,
              ...(awardBadge && { 'unlockedStages.$.badgeEarned': true }),
            },
            ...(awardBadge && { $push: { badges: stageId } }),
          },
        );
      } else {
        await this.userProgressModel.updateOne(
          { userId },
          {
            $set: topLevelSet,
            $push: {
              unlockedStages: {
                stageId,
                isPracticeUnlocked: true,
                earnedStars: newStars,
                videoWatchPercentage: 0,
                badgeEarned: awardBadge,
              },
            },
            ...(awardBadge && { $push: { badges: stageId } }),
          },
        );
      }

      return {
        stageId,
        streakIncremented,
        newStreakDays,
        badgeEarned: awardBadge ? { stageId, icon: badgeIcon } : null,
        isStageComplete,
      };
    } catch {
      throw new Error('Database not available. Please try again later.');
    }
  }
}
