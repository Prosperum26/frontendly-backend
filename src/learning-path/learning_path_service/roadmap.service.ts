import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RoadmapDocument,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

@Injectable()
export class RoadmapService {
  private readonly logger: Logger = new Logger(RoadmapService.name);

  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
  ) {}

  async getRoadmap(
    skillId: string,
    page: number = 1,
    limit: number = 5,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const dbRoadmap = await this.roadmapModel.findOne({ skillId }).lean();
    if (dbRoadmap) {
      const rawMilestones = await this.milestoneModel
        .find({ id: { $in: dbRoadmap.milestoneIds } })
        .lean();

      const milestoneIdOrder = <string[]>dbRoadmap.milestoneIds;
      const sortedMilestones = [...rawMilestones];
      sortedMilestones.sort(
        (a, b) =>
          milestoneIdOrder.indexOf(<string>a.id) -
          milestoneIdOrder.indexOf(<string>b.id),
      );
      const dbMilestones = sortedMilestones;

      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      const unlockedMap = new Map(
        (dbProgress?.unlockedStages ?? []).map(us => [
          us.stageId,
          {
            earnedStars: us.earnedStars,
            isPracticeUnlocked: us.isPracticeUnlocked,
            videoWatchPercentage: us.videoWatchPercentage,
            theoryCompleted: us.theoryCompleted,
          },
        ]),
      );

      let prevMilestoneCompleted = false;
      const milestonesWithProgress = dbMilestones.map((milestone, index) => {
        const stagesWithProgress = milestone.stages.map(stage => {
          const prog = unlockedMap.get(stage.id);
          const earnedStars = prog?.earnedStars ?? 0;
          const theoryCompleted = prog?.theoryCompleted ?? false;
          const stageProgressPercentage =
            (theoryCompleted ? 50 : 0) + Math.round((earnedStars / 3) * 50);
          return {
            id: stage.id,
            title: stage.title,
            isCompleted: earnedStars >= 1,
            earnedStars,
            stageProgressPercentage,
          };
        });

        const allCompleted = stagesWithProgress.every(s => s.isCompleted);

        let computedStatus: 'locked' | 'in_progress' | 'completed';
        if (allCompleted) {
          computedStatus = 'completed';
        } else if (index === 0 || prevMilestoneCompleted) {
          computedStatus = 'in_progress';
        } else {
          computedStatus = 'locked';
        }

        // Update previous milestone completion flag for next iteration
        prevMilestoneCompleted = computedStatus === 'completed';

        return {
          id: milestone.id,
          title: milestone.title,
          icon: milestone.icon,
          status: computedStatus,
          stages: stagesWithProgress,
        };
      });

      const startIndex = (page - 1) * limit;

      return {
        skillId: dbRoadmap.skillId,
        skillTitle: dbRoadmap.skillTitle,
        userProgress: {
          currentXp: dbProgress?.currentXp ?? 0,
          streakDays: dbProgress?.streakDays ?? 0,
        },
        milestones: milestonesWithProgress.slice(
          startIndex,
          startIndex + limit,
        ),
        pagination: {
          currentPage: page,
          limit,
          totalItems: milestonesWithProgress.length,
          totalPages: Math.ceil(milestonesWithProgress.length / limit),
        },
      };
    }

    throw new NotFoundException(
      `Roadmap not found in database for skill: ${skillId}`,
    );
  }

  async getAvailableSkills(): Promise<unknown> {
    const dbRoadmaps = await this.roadmapModel
      .find({})
      .select('skillId skillTitle')
      .lean();

    if (dbRoadmaps.length > 0) {
      return {
        skills: dbRoadmaps.map(r => ({
          skillId: r.skillId,
          skillTitle: r.skillTitle,
        })),
      };
    }

    throw new NotFoundException('No skills available');
  }
}
