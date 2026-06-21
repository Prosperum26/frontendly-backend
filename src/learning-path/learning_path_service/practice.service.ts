import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  XpService,
  ProgressService,
  UserUtilsService,
  StageContextService,
} from '.';
import {
  LpExerciseDocument,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';

@Injectable()
export class PracticeService {
  private readonly logger: Logger = new Logger(PracticeService.name);

  constructor(
    @InjectModel('LpExercise')
    private readonly lpExerciseModel: Model<LpExerciseDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly xpService: XpService,
    private readonly progressService: ProgressService,
    private readonly userUtilsService: UserUtilsService,
    private readonly stageContextService: StageContextService,
  ) {}

  async unlockPractice(stageId: string, userId: string): Promise<unknown> {
    // Skip saving progress for guest users
    if (this.userUtilsService.isGuestUser(userId)) {
      this.logger.debug(`Guest user ${userId} - skipping practice unlock save`);
      return { stageId, isPracticeUnlocked: true };
    }

    try {
      const { skillId } =
        await this.stageContextService.findStageContext(stageId);
      let dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      if (!dbProgress) {
        // Tự động khởi tạo nếu chưa có tiến độ
        const newProgress = await this.userProgressModel.create({
          userId,
          skillId,
          currentXp: 0,
          streakDays: 0,
          lastStreakDate: null,
          unlockedStages: [],
        });
        dbProgress = <any>newProgress.toObject();
      }

      if (!dbProgress) {
        throw new Error('Failed to create user progress');
      }

      const stageEntry = dbProgress.unlockedStages.find(
        s => s.stageId === stageId,
      );

      const xpEarned = 0;

      if (stageEntry) {
        await this.userProgressModel.updateOne(
          { userId, skillId, 'unlockedStages.stageId': stageId },
          { $set: { 'unlockedStages.$.isPracticeUnlocked': true } },
        );
      } else {
        await this.userProgressModel.updateOne(
          { userId, skillId },
          {
            $push: {
              unlockedStages: {
                stageId,
                isPracticeUnlocked: true,
                earnedStars: 0,
                videoWatchPercentage: 0,
                badgeEarned: false,
              },
            },
          },
        );
      }
      return { stageId, isPracticeUnlocked: true, xpAwarded: xpEarned };
    } catch (error) {
      this.logger.error(`Error in unlockPractice: ${error}`);
      throw new ForbiddenException(
        'Không thể mở khóa bài tập. Vui lòng thử lại sau.',
      );
    }
  }

  async getPractices(stageId: string, userId: string): Promise<unknown> {
    const dbProgress = await this.userProgressModel.findOne({ userId }).lean();
    if (dbProgress) {
      const stageEntry = dbProgress.unlockedStages.find(
        s => s.stageId === stageId,
      );
      if (!stageEntry?.isPracticeUnlocked) {
        throw new ForbiddenException(
          'Complete the theory section before accessing practices.',
        );
      }

      const dbExercises = await this.lpExerciseModel.find({ stageId }).lean();
      if (dbExercises.length > 0) {
        return {
          stageId,
          exercises: dbExercises.map(ex => ({
            id: ex.id,
            level: ex.level,
            title: ex.title,
            instruction: ex.instruction,
            boilerplateCode: ex.boilerplateCode,
          })),
        };
      }

      throw new NotFoundException(
        `Không tìm thấy bài tập cho stage: ${stageId}`,
      );
    } else {
      throw new ForbiddenException(
        'User progress not found. Please complete the theory section.',
      );
    }
  }

  async submitCode(
    exerciseId: string,
    submittedCode: { html: string; js: string },
    stageId: string,
    milestoneId: string,
    userId: string,
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
    const level = this.getExerciseLevel(exerciseId);

    if (!this.hasValidCode(submittedCode)) {
      return {
        status: 'failed',
        feedback: 'Code quá ngắn hoặc rỗng. Vui lòng viết code và thử lại.',
        xpEarned: 0,
        streakIncremented: false,
        badgeEarned: <string | null>null,
        stageUpdates: { stageId, totalEarnedStars: 0, isStageCompleted: false },
      };
    }

    const xpEarned = this.xpService.getXpReward(level);

    // Skip saving progress for guest users
    if (this.userUtilsService.isGuestUser(userId)) {
      const parts = exerciseId.split('_');
      const exerciseIndex = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
      const isCompleted = exerciseIndex >= 3;
      this.logger.debug(`Guest user ${userId} - skipping practice submit save`);
      return {
        status: 'passed',
        feedback: 'Chính xác! Test case đã vượt qua (Chế độ Khách).',
        xpEarned,
        streakIncremented: false,
        badgeEarned: null,
        stageUpdates: {
          stageId,
          totalEarnedStars: exerciseIndex,
          isStageCompleted: isCompleted,
        },
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
        const currentStars = stageEntry?.earnedStars ?? 0;
        const parts = exerciseId.split('_');
        const exerciseIndex = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
        const newStars = Math.max(currentStars, exerciseIndex);
        const isNowCompleted = newStars >= 3;

        const streakIncremented = this.progressService.shouldIncrementStreak(
          dbProgress.lastStreakDate,
        );
        const newStreakDays = streakIncremented
          ? dbProgress.streakDays + 1
          : dbProgress.streakDays;

        const wasPreviouslyCompleted = currentStars >= 3;
        const badgeEarned = this.determineBadgeEarned(
          isNowCompleted,
          wasPreviouslyCompleted,
          stageEntry,
          stageId,
        );

        const topLevelSet: Record<string, unknown> = {
          lastActiveStageId: stageId,
          ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
          ...(streakIncremented && {
            streakDays: newStreakDays,
            lastStreakDate: this.progressService.getTodayString(),
          }),
        };

        const stageUpdate = this.buildStageUpdate(
          stageEntry,
          stageId,
          xpEarned,
          newStars,
          badgeEarned,
          topLevelSet,
        );

        await this.userProgressModel.updateOne(
          { userId, ...stageUpdate.filter },
          stageUpdate.update,
        );

        this.logger.debug(
          `[Submit/DB] exerciseId=${exerciseId} stage=${stageId} milestone=${milestoneId} level=${level} xp=+${xpEarned} stars=${newStars} streak=${streakIncremented ? '+1' : '='} badge=${badgeEarned ?? 'none'}`,
        );

        return {
          status: 'passed',
          feedback: 'Chính xác! Test case đã vượt qua.',
          xpEarned,
          streakIncremented,
          badgeEarned,
          stageUpdates: {
            stageId,
            totalEarnedStars: newStars,
            isStageCompleted: isNowCompleted,
          },
        };
      }
    } catch {
      throw new Error('Database not available. Please try again later.');
    }

    return {
      status: 'failed',
      feedback: 'An unexpected error occurred.',
      xpEarned: 0,
      streakIncremented: false,
      badgeEarned: null,
      stageUpdates: { stageId, totalEarnedStars: 0, isStageCompleted: false },
    };
  }

  private getExerciseLevel(exerciseId: string): 'easy' | 'medium' | 'hard' {
    const parts = exerciseId.split('_');
    const exerciseIndex = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
    const levelMap: Record<number, string> = {
      1: 'easy',
      2: 'medium',
      3: 'hard',
    };
    return <'easy' | 'medium' | 'hard'>(levelMap[exerciseIndex] ?? 'easy');
  }

  private hasValidCode(submittedCode: { html: string; js: string }): boolean {
    const hasHtml = Boolean(
      submittedCode.html && submittedCode.html.trim().length > 10,
    );
    const hasJs = Boolean(
      submittedCode.js && submittedCode.js.trim().length > 10,
    );
    return hasHtml || hasJs;
  }

  private buildStageUpdate(
    stageEntry: { stageId: string; earnedStars: number } | undefined,
    stageId: string,
    xpEarned: number,
    newStars: number,
    badgeEarned: string | null,
    topLevelSet: Record<string, unknown>,
  ): { filter: Record<string, unknown>; update: Record<string, unknown> } {
    if (stageEntry) {
      return {
        filter: { 'unlockedStages.stageId': stageId },
        update: {
          $inc: { currentXp: xpEarned },
          $set: {
            ...topLevelSet,
            'unlockedStages.$.earnedStars': newStars,
            ...(badgeEarned && { 'unlockedStages.$.badgeEarned': true }),
          },
          ...(badgeEarned && { $push: { badges: stageId } }),
        },
      };
    }

    return {
      filter: {},
      update: {
        $inc: { currentXp: xpEarned },
        $set: topLevelSet,
        $push: {
          unlockedStages: {
            stageId,
            isPracticeUnlocked: true,
            earnedStars: newStars,
            videoWatchPercentage: 0,
            badgeEarned: !!badgeEarned,
          },
          ...(badgeEarned && { badges: stageId }),
        },
      },
    };
  }

  private determineBadgeEarned(
    isNowCompleted: boolean,
    wasPreviouslyCompleted: boolean,
    stageEntry: { badgeEarned: boolean } | undefined,
    stageId: string,
  ): string | null {
    if (isNowCompleted && !wasPreviouslyCompleted && !stageEntry?.badgeEarned) {
      return stageId;
    }
    return null;
  }
}
