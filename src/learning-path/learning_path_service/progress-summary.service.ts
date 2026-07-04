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

  async getProgressSummary(userId: string, skillId?: string): Promise<unknown> {
    const query: { userId: string; skillId?: string } = { userId };
    if (skillId) query.skillId = skillId;
    const dbProgress = await this.userProgressModel.findOne(query).lean();

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

      // Build completed milestones detail with badge info
      const completedMilestonesDetail = dbProgress.completedMilestones
        ? dbProgress.completedMilestones.map((cm: any) => {
            const milestone = dbMilestones.find(
              (m: any) => m.id === cm.milestoneId,
            );
            const badge = dbProgress.earnedBadges?.find(
              (b: any) => b.badgeId === cm.badgeId,
            );
            return {
              milestoneId: cm.milestoneId,
              title: milestone?.title || '',
              badge: badge || null,
              completedAt: cm.completedAt,
            };
          })
        : [];

      return {
        userId,
        currentXp: dbProgress.currentXp,
        streakDays: dbProgress.streakDays,
        earnedBadges: dbProgress.earnedBadges || [],
        completedMilestonesDetail,
        lastActiveStageId: dbProgress.lastActiveStageId,
        lastActiveMilestoneId: dbProgress.lastActiveMilestoneId,
        courseProgressPercentage,
        totalStages,
        completedStages,
        milestoneProgress,
        unlockedStages: dbProgress.unlockedStages,
      };
    }

    // Return safe zero-defaults when no progress exists
    return {
      userId,
      currentXp: 0,
      streakDays: 0,
      earnedBadges: [],
      completedMilestonesDetail: [],
      courseProgressPercentage: 0,
      totalStages: 0,
      completedStages: 0,
      milestoneProgress: {},
      unlockedStages: [],
    };
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
