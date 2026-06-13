import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RoadmapDocument } from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';

@Injectable()
export class StageContextService {
  private readonly logger: Logger = new Logger(StageContextService.name);

  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
  ) {}

  /**
   * Find stage context including previous stage, milestone, and skill ID
   * This is a simplified version to reduce cognitive complexity
   */
  async findStageContext(stageId: string): Promise<{
    prevStageId: string | null;
    milestoneId: string | null;
    skillId: string;
  }> {
    // Try DB first
    try {
      const dbMilestone = await this.milestoneModel
        .findOne({ 'stages.id': stageId })
        .lean();

      if (dbMilestone) {
        const si = dbMilestone.stages.findIndex(s => s.id === stageId);
        const milestoneId = <string>dbMilestone.id;

        // Look up the roadmap to get skillId
        const dbRoadmap = await this.roadmapModel
          .findOne({ milestoneIds: milestoneId })
          .lean();
        const skillId = dbRoadmap?.skillId ?? 'frontend';

        if (si > 0) {
          return {
            prevStageId: dbMilestone.stages[si - 1].id,
            milestoneId,
            skillId,
          };
        }

        // Check if there's a previous milestone
        if (dbRoadmap) {
          const mi = (<string[]>dbRoadmap.milestoneIds).indexOf(milestoneId);
          if (mi > 0) {
            const prevMilestone = await this.milestoneModel
              .findOne({ id: dbRoadmap.milestoneIds[mi - 1] })
              .lean();
            if (prevMilestone && prevMilestone.stages.length > 0) {
              return {
                prevStageId:
                  prevMilestone.stages[prevMilestone.stages.length - 1].id,
                milestoneId,
                skillId,
              };
            }
          }
        }

        return { prevStageId: null, milestoneId, skillId }; // first stage
      }
    } catch (error) {
      this.logger.warn(`DB error in findStageContext: ${String(error)}`);
      throw new Error('Database not available. Please try again later.');
    }

    throw new Error(`Stage not found: ${stageId}`);
  }
}
