import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { XpService } from './xp.service';
import {
  UserLearningProgressDocument,
  RoadmapDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

export interface GuestStageProgress {
  stageId: string;
  theoryViewed: boolean;
  viewedAt: number;
}

@Injectable()
export class GuestSyncService {
  private readonly logger: Logger = new Logger(GuestSyncService.name);

  constructor(
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    private readonly xpService: XpService,
  ) {}

  /**
   * Derive the skillId from a list of stageIds by looking up which
   * milestone contains the stage, then which roadmap contains that milestone.
   */
  async deriveSkillIdFromStages(stageIds: string[]): Promise<string | null> {
    if (stageIds.length === 0) return null;

    try {
      // Find milestone containing the first stage
      const milestone = await this.milestoneModel
        .findOne({ 'stages.id': stageIds[0] })
        .lean();

      if (!milestone) return null;

      const milestoneId = <string>milestone.id;

      // Find roadmap containing this milestone
      const roadmap = await this.roadmapModel
        .findOne({ milestoneIds: milestoneId })
        .lean();

      return roadmap?.skillId ?? null;
    } catch (error) {
      this.logger.warn(`Error deriving skillId: ${String(error)}`);
      return null;
    }
  }

  /**
   * Sync guest progress into a real user's UserLearningProgress document.
   * Only adds stages that don't already exist — never overwrites real progress.
   *
   * @param userId The authenticated user's ID
   * @param guestProgress Array of guest stage progress from FE LocalStorage
   * @returns Number of stages synced
   */
  async syncGuestProgress(
    userId: string,
    guestProgress: GuestStageProgress[],
  ): Promise<{ syncedStages: number; skillId: string | null }> {
    if (!guestProgress || guestProgress.length === 0) {
      return { syncedStages: 0, skillId: null };
    }

    const stageIds = guestProgress.map(gp => gp.stageId);

    // Dynamically derive skillId from the guest's viewed theories
    const skillId = await this.deriveSkillIdFromStages(stageIds);
    if (!skillId) {
      this.logger.warn(
        `Could not derive skillId from guest stages: ${stageIds.join(', ')}`,
      );
      return { syncedStages: 0, skillId: null };
    }

    try {
      // Find or create UserLearningProgress
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      if (!dbProgress) {
        await this.userProgressModel.create({
          userId,
          skillId,
          currentXp: 0,
          streakDays: 0,
          lastStreakDate: null,
          unlockedStages: [],
          earnedBadges: [],
          completedMilestones: [],
          totalCompletedStages: 0,
        });
      }

      // Build set of already-unlocked stageIds
      const existingStageIds = new Set(
        dbProgress?.unlockedStages.map(s => s.stageId) ?? [],
      );

      // Filter to only stages not yet present
      const newStages = guestProgress.filter(
        gp => !existingStageIds.has(gp.stageId),
      );

      if (newStages.length === 0) {
        this.logger.debug(
          `All guest stages already exist for user ${userId}, nothing to sync`,
        );
        return { syncedStages: 0, skillId };
      }

      // Build unlockedStage entries for guest progress
      const stagesToPush = newStages
        .filter(gp => gp.theoryViewed)
        .map(gp => ({
          stageId: gp.stageId,
          theoryCompleted: true,
          theoryXpAwarded: true,
          isPracticeUnlocked: true,
          earnedStars: 0,
          hasSubmittedExercise: false,
          videoWatchPercentage: 0,
          videoSeekPercentage: 0,
          badgeEarned: false,
        }));

      if (stagesToPush.length > 0) {
        // Set the lastActiveStageId to the most recently viewed theory
        const sortedByTime = [...newStages].sort(
          (a, b) => b.viewedAt - a.viewedAt,
        );
        const lastActiveStageId = sortedByTime[0].stageId;

        // Find the milestoneId for the last active stage
        const lastMilestone = await this.milestoneModel
          .findOne({ 'stages.id': lastActiveStageId })
          .lean();
        const lastActiveMilestoneId = lastMilestone
          ? <string>lastMilestone.id
          : null;

        const xpPerTheory = this.xpService.getXpReward('theory');
        const totalXpEarned = stagesToPush.length * xpPerTheory;

        await this.userProgressModel.updateOne(
          { userId, skillId },
          {
            $push: { unlockedStages: { $each: stagesToPush } },
            $set: {
              lastActiveStageId,
              ...(lastActiveMilestoneId && { lastActiveMilestoneId }),
            },
            ...(totalXpEarned > 0 && { $inc: { currentXp: totalXpEarned } }),
          },
        );
      }

      this.logger.log(
        `Synced ${stagesToPush.length} guest stage(s) for user ${userId} (skill: ${skillId})`,
      );

      return { syncedStages: stagesToPush.length, skillId };
    } catch (error) {
      this.logger.error(`Error syncing guest progress: ${String(error)}`);
      return { syncedStages: 0, skillId };
    }
  }
}
