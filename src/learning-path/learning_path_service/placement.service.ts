import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserUtilsService } from '.';
import {
  RoadmapDocument,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

@Injectable()
export class PlacementService {
  private readonly logger: Logger = new Logger(PlacementService.name);

  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly userUtilsService: UserUtilsService,
  ) {}

  async syncPlacementTest(
    skipToMilestoneId: string,
    userId: string,
    skillId: string,
  ): Promise<unknown> {
    // Skip saving progress for guest users
    if (this.userUtilsService.isGuestUser(userId)) {
      this.logger.debug(`Guest user ${userId} - skipping placement test save`);
      return {
        success: false,
        placementTestCompleted: false,
        skipToMilestoneId,
        unlockedStagesCount: 0,
        message: 'Guest users cannot save placement test results',
      };
    }

    const dbRoadmap = await this.roadmapModel.findOne({ skillId }).lean();
    const milestoneIds: string[] = <string[]>(dbRoadmap?.milestoneIds ?? []);
    const skipIndex = milestoneIds.indexOf(skipToMilestoneId);
    const completedStageIds: string[] = [];

    if (dbRoadmap && skipIndex > 0) {
      const prevMilestones = await this.milestoneModel
        .find({ id: { $in: milestoneIds.slice(0, skipIndex) } })
        .lean();

      for (const m of prevMilestones) {
        for (const s of m.stages) completedStageIds.push(s.id);
      }

      await this.userProgressModel.updateOne(
        { userId, skillId },
        {
          $set: {
            placementTestCompleted: true,
            skipToMilestoneId,
            badges: completedStageIds,
            unlockedStages: completedStageIds.map(sid => ({
              stageId: sid,
              isPracticeUnlocked: true,
              earnedStars: 3,
              videoWatchPercentage: 100,
              badgeEarned: true,
            })),
          },
        },
        { upsert: true },
      );

      return {
        success: true,
        placementTestCompleted: true,
        skipToMilestoneId,
        unlockedStagesCount: completedStageIds.length,
      };
    }

    throw new Error('Database not available. Please try again later.');
  }
}
