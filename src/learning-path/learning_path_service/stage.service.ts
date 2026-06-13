import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  StageContextService,
  ProgressService,
  UserUtilsService,
  XpService,
} from '.';
import {
  UserLearningProgressDocument,
  RoadmapDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

@Injectable()
export class StageService {
  private readonly logger: Logger = new Logger(StageService.name);

  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly stageContextService: StageContextService,
    private readonly progressService: ProgressService,
    private readonly userUtilsService: UserUtilsService,
    private readonly xpService: XpService,
  ) {}

  async completeStage(
    stageId: string,
    userId: string,
  ): Promise<{
    stageId: string;
    streakIncremented: boolean;
    newStreakDays: number;
    badgeEarned: { stageId: string; icon: string } | null;
    isStageComplete: boolean;
    xpEarned: number;
    isMilestoneComplete?: boolean;
  }> {
    const { milestoneId, skillId } =
      await this.stageContextService.findStageContext(stageId);

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
        xpEarned: 0,
      };
    }

    const badgeIcon = await this.resolveBadgeIcon(stageId, milestoneId);

    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
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
      const xpEarned = isStageComplete ? this.xpService.getXpReward('hard') : 0;

      const topLevelSet = this.buildTopLevelSet(
        stageId,
        milestoneId ?? undefined,
        streakIncremented,
        newStreakDays,
      );

      await this.saveStageProgress(userId, stageId, stageEntry, {
        newStars,
        xpEarned,
        awardBadge,
        topLevelSet,
      });

      if (isStageComplete) {
        await this.unlockNextStage(stageId, userId, skillId);
      }

      const isMilestoneComplete = milestoneId
        ? await this.isMilestoneCompleted(milestoneId, userId, skillId)
        : false;

      return {
        stageId,
        streakIncremented,
        newStreakDays,
        badgeEarned: awardBadge ? { stageId, icon: badgeIcon } : null,
        isStageComplete,
        isMilestoneComplete,
        xpEarned,
      };
    } catch {
      throw new Error('Database not available. Please try again later.');
    }
  }

  async unlockNextStage(
    stageId: string,
    userId: string,
    skillId: string,
  ): Promise<void> {
    if (this.userUtilsService.isGuestUser(userId)) {
      return;
    }

    try {
      const dbRoadmap = await this.roadmapModel.findOne({ skillId }).lean();
      if (!dbRoadmap) return;

      const milestoneIds = <string[]>dbRoadmap.milestoneIds;
      interface MilestoneOrderLean {
        id: string;
        stages: Array<{ id: string }>;
      }

      const milestones = await this.milestoneModel
        .find({ id: { $in: milestoneIds } })
        .lean<MilestoneOrderLean[]>();

      milestones.sort(
        (a, b) => milestoneIds.indexOf(a.id) - milestoneIds.indexOf(b.id),
      );

      const allStages = milestones.flatMap(m => m.stages);
      const currentIndex = allStages.findIndex(s => s.id === stageId);
      if (currentIndex === -1 || currentIndex >= allStages.length - 1) {
        return;
      }

      const nextStageId = allStages[currentIndex + 1].id;
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      if (dbProgress) {
        const nextStageEntry = dbProgress.unlockedStages.find(
          s => s.stageId === nextStageId,
        );
        if (nextStageEntry) {
          await this.userProgressModel.updateOne(
            { userId, 'unlockedStages.stageId': nextStageId },
            { $set: { 'unlockedStages.$.isPracticeUnlocked': false } },
          );
        } else {
          await this.userProgressModel.updateOne(
            { userId },
            {
              $push: {
                unlockedStages: {
                  stageId: nextStageId,
                  isPracticeUnlocked: false,
                  earnedStars: 0,
                  videoWatchPercentage: 0,
                  badgeEarned: false,
                  theoryCompleted: false,
                  theoryXpAwarded: false,
                  hasSubmittedExercise: false,
                },
              },
            },
          );
        }
      } else {
        this.logger.warn(
          `unlockNextStage: no progress document found for userId=${userId}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Failed to unlock next stage: ${String(error)}`);
    }
  }

  async completeTheory(
    stageId: string,
    userId: string,
  ): Promise<{ xpEarned: number }> {
    if (this.userUtilsService.isGuestUser(userId)) {
      return { xpEarned: 0 };
    }

    try {
      const { milestoneId, skillId } =
        await this.stageContextService.findStageContext(stageId);

      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      if (!dbProgress) {
        return { xpEarned: 0 };
      }

      const stageEntry = dbProgress.unlockedStages.find(
        s => s.stageId === stageId,
      );

      const alreadyAwarded = stageEntry?.theoryXpAwarded ?? false;
      const xpEarned = alreadyAwarded
        ? 0
        : this.xpService.getXpReward('theory');

      if (stageEntry) {
        if (!stageEntry.theoryCompleted || !alreadyAwarded) {
          await this.userProgressModel.updateOne(
            { userId, skillId, 'unlockedStages.stageId': stageId },
            {
              $set: {
                lastActiveStageId: stageId,
                ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
                'unlockedStages.$.theoryCompleted': true,
                'unlockedStages.$.theoryXpAwarded': true,
                'unlockedStages.$.isPracticeUnlocked': true,
              },
              ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
            },
          );
        }
      } else {
        await this.userProgressModel.updateOne(
          { userId, skillId },
          {
            $set: {
              lastActiveStageId: stageId,
              ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
            },
            $push: {
              unlockedStages: {
                stageId,
                theoryCompleted: true,
                theoryXpAwarded: true,
                isPracticeUnlocked: true,
                earnedStars: 0,
                videoWatchPercentage: 0,
                badgeEarned: false,
              },
            },
            ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
          },
        );
      }

      return { xpEarned };
    } catch (error) {
      this.logger.warn(`Failed to complete theory: ${String(error)}`);
      return { xpEarned: 0 };
    }
  }

  async isMilestoneCompleted(
    milestoneId: string,
    userId: string,
    skillId: string,
  ): Promise<boolean> {
    if (this.userUtilsService.isGuestUser(userId)) {
      return false;
    }

    try {
      const milestone = await this.milestoneModel
        .findOne({ id: milestoneId })
        .lean();
      if (!milestone) return false;

      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();
      if (!dbProgress) return false;

      const unlockedMap = new Map(
        dbProgress.unlockedStages.map(s => [s.stageId, s.earnedStars]),
      );
      return milestone.stages.every(s => (unlockedMap.get(s.id) ?? 0) >= 1);
    } catch (error) {
      this.logger.warn(`Error checking milestone completion: ${String(error)}`);
      return false;
    }
  }

  private async resolveBadgeIcon(
    stageId: string,
    milestoneId: string | null | undefined,
  ): Promise<string> {
    if (!milestoneId) {
      return '';
    }

    const parentMilestone = await this.milestoneModel
      .findOne({ id: milestoneId })
      .lean();

    if (!parentMilestone) {
      return '';
    }

    const stageDoc = parentMilestone.stages.find(s => s.id === stageId);
    return (
      (<{ icon?: string }>stageDoc).icon ||
      (<{ icon?: string }>parentMilestone).icon ||
      ''
    );
  }

  private buildTopLevelSet(
    stageId: string,
    milestoneId: string | undefined,
    streakIncremented: boolean,
    newStreakDays: number,
  ): Record<string, unknown> {
    return {
      lastActiveStageId: stageId,
      ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
      ...(streakIncremented && {
        streakDays: newStreakDays,
        lastStreakDate: this.progressService.getTodayString(),
      }),
    };
  }

  private async saveStageProgress(
    userId: string,
    stageId: string,
    stageEntry: { earnedStars: number; badgeEarned: boolean } | undefined,
    params: {
      newStars: number;
      xpEarned: number;
      awardBadge: boolean;
      topLevelSet: Record<string, unknown>;
    },
  ): Promise<void> {
    const { newStars, xpEarned, awardBadge, topLevelSet } = params;

    if (stageEntry) {
      await this.userProgressModel.updateOne(
        { userId, 'unlockedStages.stageId': stageId },
        {
          $set: {
            ...topLevelSet,
            'unlockedStages.$.earnedStars': newStars,
            'unlockedStages.$.isPracticeUnlocked': true,
            'unlockedStages.$.hasSubmittedExercise': true,
            ...(awardBadge && { 'unlockedStages.$.badgeEarned': true }),
          },
          ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
          ...(awardBadge && { $push: { badges: stageId } }),
        },
      );
    } else {
      await this.userProgressModel.updateOne(
        { userId },
        {
          $set: { ...topLevelSet },
          ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
          $push: {
            unlockedStages: {
              stageId,
              isPracticeUnlocked: true,
              earnedStars: newStars,
              hasSubmittedExercise: true,
              videoWatchPercentage: 0,
              badgeEarned: awardBadge,
            },
            ...(awardBadge && { badges: stageId }),
          },
        },
      );
    }
  }
}
