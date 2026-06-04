import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserLearningProgressDocument } from '../db_schemas/learning_path_schemas';
import { XPService, StageContextService, UserUtilsService } from '../learning_path_service';

@Injectable()
export class VideoService {
  private readonly logger: Logger = new Logger(VideoService.name);

  constructor(
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly xpService: XPService,
    private readonly stageContextService: StageContextService,
    private readonly userUtilsService: UserUtilsService,
  ) {}

  async updateVideoProgress(
    stageId: string,
    watchPercentage: number,
    seekPercentage: number = 0,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const clampedPct = Math.min(100, Math.max(0, watchPercentage));
    const clampedSeekPct = Math.min(100, Math.max(0, seekPercentage));
    const VIDEO_XP_THRESHOLD = 80;
    const MAX_SEEK_THRESHOLD = 20;

    // Skip saving progress for guest users
    if (this.userUtilsService.isGuestUser(userId)) {
      this.logger.debug(`Guest user ${userId} - skipping video progress save`);
      return {
        stageId,
        videoWatchPercentage: clampedPct,
        videoSeekPercentage: clampedSeekPct,
        xpEarned: 0,
        thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
        seekExceeded: clampedSeekPct > MAX_SEEK_THRESHOLD,
      };
    }

    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (dbProgress) {
        const stageEntry = dbProgress.unlockedStages.find(
          s => s.stageId === stageId,
        );
        const prevPct = stageEntry?.videoWatchPercentage ?? 0;
        const crossesThreshold =
          prevPct < VIDEO_XP_THRESHOLD && clampedPct >= VIDEO_XP_THRESHOLD;

        // Only award XP if watch threshold reached AND seek is within limit
        const xpEarned =
          crossesThreshold && clampedSeekPct <= MAX_SEEK_THRESHOLD
            ? this.xpService.getVideoIntroReward()
            : 0;

        if (stageEntry) {
          await this.userProgressModel.updateOne(
            { userId, 'unlockedStages.stageId': stageId },
            {
              $set: {
                'unlockedStages.$.videoWatchPercentage': clampedPct,
                'unlockedStages.$.videoSeekPercentage': clampedSeekPct,
              },
              ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
            },
          );
        } else {
          await this.userProgressModel.updateOne(
            { userId },
            {
              $push: {
                unlockedStages: {
                  stageId,
                  isPracticeUnlocked: false,
                  earnedStars: 0,
                  videoWatchPercentage: clampedPct,
                  videoSeekPercentage: clampedSeekPct,
                  badgeEarned: false,
                },
              },
              ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
            },
          );
        }

        return {
          stageId,
          videoWatchPercentage: clampedPct,
          videoSeekPercentage: clampedSeekPct,
          xpEarned,
          thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
          seekExceeded: clampedSeekPct > MAX_SEEK_THRESHOLD,
        };
      }

      const { skillId } =
        await this.stageContextService.findStageContext(stageId);

      // Only award XP if watch threshold reached AND seek is within limit
      const xpEarned =
        clampedPct >= VIDEO_XP_THRESHOLD && clampedSeekPct <= MAX_SEEK_THRESHOLD
          ? this.xpService.getVideoIntroReward()
          : 0;

      await this.userProgressModel.updateOne(
        { userId, skillId },
        {
          $setOnInsert: {
            userId,
            skillId,
            currentXp: 0,
            streakDays: 0,
            lastStreakDate: null,
            badges: [],
            lastActiveStageId: null,
            lastActiveMilestoneId: null,
            placementTestCompleted: false,
            skipToMilestoneId: null,
          },
          $push: {
            unlockedStages: {
              stageId,
              isPracticeUnlocked: false,
              earnedStars: 0,
              videoWatchPercentage: clampedPct,
              videoSeekPercentage: clampedSeekPct,
              badgeEarned: false,
            },
          },
          ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
        },
        { upsert: true },
      );

      return {
        stageId,
        videoWatchPercentage: clampedPct,
        videoSeekPercentage: clampedSeekPct,
        xpEarned,
        thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
        seekExceeded: clampedSeekPct > MAX_SEEK_THRESHOLD,
      };
    } catch {
      throw new Error('Database not available. Please try again later.');
    }
  }

  async updateIntroVideoProgress(
    watchPercentage: number,
    seekPercentage: number = 0,
    userId: string = 'dummy-user-001',
    skillId: string = 'frontend',
  ): Promise<unknown> {
    const clampedPct = Math.min(100, Math.max(0, watchPercentage));
    const clampedSeekPct = Math.min(100, Math.max(0, seekPercentage));
    const VIDEO_XP_THRESHOLD = 80;
    const MAX_SEEK_THRESHOLD = 20;

    // Skip saving progress for guest users
    if (this.userUtilsService.isGuestUser(userId)) {
      this.logger.debug(
        `Guest user ${userId} - skipping intro video progress save`,
      );
      return {
        videoWatchPercentage: clampedPct,
        videoSeekPercentage: clampedSeekPct,
        xpEarned: 0,
        thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
        seekExceeded: clampedSeekPct > MAX_SEEK_THRESHOLD,
        xpAlreadyAwarded: false,
      };
    }

    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      if (dbProgress) {
        const prevPct = dbProgress.introVideoWatchPercentage || 0;
        const crossesThreshold =
          prevPct < VIDEO_XP_THRESHOLD && clampedPct >= VIDEO_XP_THRESHOLD;

        // Only award XP if watch threshold reached AND seek is within limit AND not already awarded
        const xpEarned =
          crossesThreshold &&
          clampedSeekPct <= MAX_SEEK_THRESHOLD &&
          !dbProgress.introVideoXpAwarded
            ? this.xpService.getVideoIntroReward()
            : 0;

        await this.userProgressModel.updateOne(
          { userId, skillId },
          {
            $set: {
              introVideoWatchPercentage: clampedPct,
              introVideoSeekPercentage: clampedSeekPct,
              ...(xpEarned > 0 && { introVideoXpAwarded: true }),
            },
            ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
          },
        );

        return {
          videoWatchPercentage: clampedPct,
          videoSeekPercentage: clampedSeekPct,
          xpEarned,
          thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
          seekExceeded: clampedSeekPct > MAX_SEEK_THRESHOLD,
          xpAlreadyAwarded: dbProgress.introVideoXpAwarded,
        };
      }

      // Create new progress document
      const xpEarned =
        clampedPct >= VIDEO_XP_THRESHOLD && clampedSeekPct <= MAX_SEEK_THRESHOLD
          ? this.xpService.getVideoIntroReward()
          : 0;

      await this.userProgressModel.updateOne(
        { userId, skillId },
        {
          $setOnInsert: {
            userId,
            skillId,
            currentXp: 0,
            streakDays: 0,
            lastStreakDate: null,
            badges: [],
            lastActiveStageId: null,
            lastActiveMilestoneId: null,
            placementTestCompleted: false,
            skipToMilestoneId: null,
            introVideoWatchPercentage: clampedPct,
            introVideoSeekPercentage: clampedSeekPct,
            introVideoXpAwarded: xpEarned > 0,
          },
          ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
        },
        { upsert: true },
      );

      return {
        videoWatchPercentage: clampedPct,
        videoSeekPercentage: clampedSeekPct,
        xpEarned,
        thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
        seekExceeded: clampedSeekPct > MAX_SEEK_THRESHOLD,
        xpAlreadyAwarded: false,
      };
    } catch {
      throw new Error('Database not available. Please try again later.');
    }
  }
}
