import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { XpService } from './xp.service';
import { UserLearningProgressDocument } from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

@Injectable()
export class ProgressService {
  private readonly logger: Logger = new Logger(ProgressService.name);

  constructor(
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    private readonly xpService: XpService,
  ) {}

  /**
   * Get today's date string in YYYY-MM-DD format
   */
  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Check if streak should be incremented
   */
  shouldIncrementStreak(lastStreakDate: string | null): boolean {
    return lastStreakDate !== this.getTodayString();
  }

  /**
   * Compute progress statistics
   */
  computeProgress(
    milestones: Array<{ id: string; stages: Array<{ id: string }> }>,
    unlockedMap: Map<
      string,
      {
        earnedStars: number;
        isPracticeUnlocked: boolean;
        videoWatchPercentage: number;
        theoryCompleted?: boolean;
      }
    >,
  ): {
    courseProgressPercentage: number;
    milestoneProgress: Record<string, number>;
  } {
    let totalStages = 0;
    let totalCompletedProgress = 0;
    const milestoneProgress: Record<string, number> = {};

    for (const m of milestones) {
      const stageCount = m.stages.length;
      totalStages += stageCount;
      let completedProgressInMilestone = 0;

      for (const s of m.stages) {
        const prog = unlockedMap.get(s.id);
        const earnedStars = prog?.earnedStars ?? 0;
        const theoryCompleted = prog?.theoryCompleted ?? false;
        const stageProgress =
          (theoryCompleted ? 50 : 0) + Math.round((earnedStars / 3) * 50);
        completedProgressInMilestone += stageProgress;
        totalCompletedProgress += stageProgress;
      }

      milestoneProgress[m.id] =
        stageCount > 0
          ? Math.round(completedProgressInMilestone / stageCount)
          : 0;
    }

    const courseProgressPercentage =
      totalStages > 0 ? Math.round(totalCompletedProgress / totalStages) : 0;

    return { courseProgressPercentage, milestoneProgress };
  }

  /**
   * Get user progress from database
   */
  async getUserProgress(
    userId: string,
    skillId: string,
  ): Promise<UserLearningProgressDocument | null> {
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();
      return dbProgress;
    } catch (error) {
      this.logger.warn(`Error getting user progress: ${String(error)}`);
      return null;
    }
  }

  /**
   * Update user streak
   */
  async updateStreak(
    userId: string,
    skillId: string,
  ): Promise<{
    streakIncremented: boolean;
    newStreakDays: number;
  }> {
    const dbProgress = await this.getUserProgress(userId, skillId);
    if (!dbProgress) {
      return { streakIncremented: false, newStreakDays: 0 };
    }

    const streakIncremented = this.shouldIncrementStreak(
      dbProgress.lastStreakDate,
    );
    const newStreakDays = streakIncremented
      ? dbProgress.streakDays + 1
      : dbProgress.streakDays;

    if (streakIncremented) {
      await this.userProgressModel.updateOne(
        { userId, skillId },
        {
          $set: {
            streakDays: newStreakDays,
            lastStreakDate: this.getTodayString(),
          },
        },
      );
    }

    return { streakIncremented, newStreakDays };
  }

  calculateMilestoneProgress(
    milestone: { stages: Array<{ id: string }> },
    unlockedMap: Map<
      string,
      { earnedStars: number; theoryCompleted?: boolean }
    >,
  ): number {
    const stageCount = milestone.stages.length;
    if (stageCount === 0) return 0;

    let completedProgress = 0;
    for (const s of milestone.stages) {
      const prog = unlockedMap.get(s.id);
      const earnedStars = prog?.earnedStars ?? 0;
      const theoryCompleted = prog?.theoryCompleted ?? false;
      completedProgress +=
        (theoryCompleted ? 50 : 0) + Math.round((earnedStars / 3) * 50);
    }

    return Math.round(completedProgress / stageCount);
  }
}
