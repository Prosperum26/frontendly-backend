import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProgressService } from '.';
import {
  RoadmapDocument,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

@Injectable()
export class ProgressSummaryService {
  private readonly logger: Logger = new Logger(ProgressSummaryService.name);

  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly progressService: ProgressService,
  ) {}

  async getProgressSummary(
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const dbProgress = await this.userProgressModel.findOne({ userId }).lean();

    if (dbProgress) {
      const dbRoadmap = await this.roadmapModel
        .findOne({ skillId: dbProgress.skillId })
        .lean();

      const rawMilestones = dbRoadmap
        ? await this.milestoneModel
            .find({ id: { $in: dbRoadmap.milestoneIds } })
            .lean()
        : [];

      const milestoneIdOrder = <string[]>(dbRoadmap?.milestoneIds ?? []);
      const sortedMilestones = [...rawMilestones];
      sortedMilestones.sort(
        (a, b) =>
          milestoneIdOrder.indexOf(<string>a.id) -
          milestoneIdOrder.indexOf(<string>b.id),
      );
      const dbMilestones = sortedMilestones;

      const unlockedMap = new Map(
        dbProgress.unlockedStages.map(us => [
          us.stageId,
          {
            earnedStars: us.earnedStars,
            isPracticeUnlocked: us.isPracticeUnlocked,
            videoWatchPercentage: us.videoWatchPercentage,
            theoryCompleted: us.theoryCompleted,
          },
        ]),
      );

      const { courseProgressPercentage, milestoneProgress } =
        this.computeProgress(dbMilestones, unlockedMap);

      const totalStages = dbMilestones.reduce(
        (sum, m) => sum + m.stages.length,
        0,
      );
      const completedStages = dbProgress.unlockedStages.filter(
        s => s.earnedStars >= 3,
      ).length;

      return {
        userId,
        currentXp: dbProgress.currentXp,
        streakDays: dbProgress.streakDays,
        badges: dbProgress.badges,
        lastActiveStageId: dbProgress.lastActiveStageId,
        lastActiveMilestoneId: dbProgress.lastActiveMilestoneId,
        courseProgressPercentage,
        totalStages,
        completedStages,
        milestoneProgress,
        unlockedStages: dbProgress.unlockedStages,
      };
    }

    throw new Error('Database not available. Please try again later.');
  }

  private computeProgress(
    milestones: Array<{ id: string; stages: Array<{ id: string }> }>,
    unlockedMap: Map<
      string,
      {
        earnedStars: number;
        isPracticeUnlocked: boolean;
        videoWatchPercentage: number;
      }
    >,
  ): {
    courseProgressPercentage: number;
    milestoneProgress: Record<string, number>;
  } {
    return this.progressService.computeProgress(milestones, unlockedMap);
  }
}
