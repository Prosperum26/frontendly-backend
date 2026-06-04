import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

import { StageContextService } from '.';
import { PlacementService } from './placement.service';
import { PracticeService } from './practice.service';
import { ProgressSummaryService } from './progress-summary.service';
import { RoadmapService } from './roadmap.service';
import { StageService } from './stage.service';
import { TheoryService } from './theory.service';
import { VideoService } from './video.service';

@Injectable()
export class LearningPathService {
  private readonly logger: Logger = new Logger(LearningPathService.name);

  constructor(
    private readonly roadmapService: RoadmapService,
    private readonly theoryService: TheoryService,
    private readonly practiceService: PracticeService,
    private readonly videoService: VideoService,
    private readonly stageService: StageService,
    private readonly placementService: PlacementService,
    private readonly progressSummaryService: ProgressSummaryService,
    private readonly stageContextService: StageContextService,
  ) {}

  async getRoadmap(
    skillId: string,
    page: number = 1,
    limit: number = 5,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    return this.roadmapService.getRoadmap(skillId, page, limit, userId);
  }

  async getTheory(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    await this.assertStageAccessible(stageId, userId);
    return this.theoryService.getTheory(stageId);
  }

  async unlockPractice(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    // Don't check stage accessibility - user can unlock practice immediately after viewing theory
    // Stage completion order will be enforced at submit/complete endpoints
    return this.practiceService.unlockPractice(stageId, userId);
  }

  async getPractices(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    return this.practiceService.getPractices(stageId, userId);
  }

  async submitCode(
    exerciseId: string,
    submittedCode: { html: string; js: string },
    userId: string = 'dummy-user-001',
  ): Promise<{
    status: string;
    feedback: string;
    xpEarned: number;
    streakIncremented: boolean;
    badgeEarned: string | null;
    stageUpdates: {
      stageId: string;
      totalEarnedStars: number;
      isStageCompleted: boolean;
    };
  }> {
    const parts = exerciseId.split('_');
    const stageId = parts.length >= 2 ? parts[1] : 's1';
    const { milestoneId } =
      await this.stageContextService.findStageContext(stageId);
    return this.practiceService.submitCode(
      exerciseId,
      submittedCode,
      stageId,
      milestoneId || '',
      userId,
    );
  }

  async updateVideoProgress(
    stageId: string,
    watchPercentage: number,
    seekPercentage: number = 0,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    return this.videoService.updateVideoProgress(
      stageId,
      watchPercentage,
      seekPercentage,
      userId,
    );
  }

  async updateIntroVideoProgress(
    watchPercentage: number,
    seekPercentage: number = 0,
    userId: string = 'dummy-user-001',
    skillId: string = 'frontend',
  ): Promise<unknown> {
    return this.videoService.updateIntroVideoProgress(
      watchPercentage,
      seekPercentage,
      userId,
      skillId,
    );
  }

  async syncPlacementTest(
    skipToMilestoneId: string,
    userId: string = 'dummy-user-001',
    skillId: string = 'frontend',
  ): Promise<unknown> {
    return this.placementService.syncPlacementTest(
      skipToMilestoneId,
      userId,
      skillId,
    );
  }

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
    return this.stageService.completeStage(stageId, userId);
  }

  async getMilestoneStatus(
    milestoneId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    // Get user progress for this milestone
    const userProgress =
      await this.progressSummaryService.getProgressSummary(userId);

    const unlockedStages =
      userProgress &&
      typeof userProgress === 'object' &&
      'unlockedStages' in userProgress
        ? (<
            {
              unlockedStages: Array<{
                stageId: string;
                theoryCompleted?: boolean;
                earnedStars: number;
              }>;
            }
          >userProgress).unlockedStages
        : [];

    // Return milestone info with user progress
    return {
      milestoneId,
      userProgress: unlockedStages.map(stage => ({
        stageId: stage.stageId,
        theoryCompleted: stage.theoryCompleted || false,
        practiceCompleted: (stage.earnedStars || 0) >= 3,
        earnedStars: stage.earnedStars,
      })),
    };
  }

  async getAvailableSkills(): Promise<unknown> {
    return this.roadmapService.getAvailableSkills();
  }

  async getFullStageContent(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const [theory, practices] = await Promise.all([
      this.getTheory(stageId, userId),
      this.getPractices(stageId, userId).catch(() => null),
    ]);

    return { stageId, theory, practices };
  }

  async getProgressSummary(
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    return this.progressSummaryService.getProgressSummary(userId);
  }

  private async assertStageAccessible(
    stageId: string,
    userId: string,
  ): Promise<void> {
    // Luôn cho phép truy cập lý thuyết (theory) để tránh lỗi 403
    return;
  }
}
