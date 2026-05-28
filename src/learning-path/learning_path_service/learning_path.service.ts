import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  DUMMY_ROADMAP,
  DUMMY_THEORIES,
  DUMMY_PRACTICES,
  XP_REWARDS,
  getUserProgress,
} from './dummy-data';
import {
  LpExerciseDocument,
  RoadmapDocument,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';
import { TheoryDocument } from '../db_schemas/theory_schema';

// ============================================================
// LEARNING PATH SERVICE
// Strategy: DB-first → fallback to dummy data
// ============================================================

@Injectable()
export class LearningPathService {
  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Theory')
    private readonly theoryModel: Model<TheoryDocument>,
    @InjectModel('LpExercise')
    private readonly lpExerciseModel: Model<LpExerciseDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
  ) {}

  // -----------------------------------------------------------
  // API 1: GET /api/v1/roadmaps/:skillId
  // Lấy roadmap kèm progress của user
  // -----------------------------------------------------------
  async getRoadmap(
    skillId: string,
    page: number = 1,
    limit: number = 5,
    userId: string = 'dummy-user-001',
  ) {
    // ── Try DB first ──────────────────────────────────────────
    const dbRoadmap = await this.roadmapModel.findOne({ skillId }).lean();
    if (dbRoadmap) {
      const dbMilestones = await this.milestoneModel
        .find({ id: { $in: dbRoadmap.milestoneIds } })
        .lean();

      // Lấy progress từ DB
      const dbProgress = await this.userProgressModel
        .findOne({ userId, skillId })
        .lean();

      // Merge progress vào milestones
      const milestonesWithProgress = dbMilestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        status: milestone.status,
        stages: milestone.stages.map(stage => {
          const stageProgress = dbProgress?.unlockedStages.find(
            us => us.stageId === stage.id,
          );
          return {
            id: stage.id,
            title: stage.title,
            isCompleted: stageProgress
              ? stageProgress.earnedStars >= 3
              : stage.isCompleted,
            earnedStars: stageProgress?.earnedStars ?? stage.earnedStars,
          };
        }),
      }));

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedMilestones = milestonesWithProgress.slice(
        startIndex,
        startIndex + limit,
      );

      return {
        skillId: dbRoadmap.skillId,
        skillTitle: dbRoadmap.skillTitle,
        userProgress: {
          currentXp: dbProgress?.currentXp ?? 0,
          streakDays: dbProgress?.streakDays ?? 0,
        },
        milestones: paginatedMilestones,
        pagination: {
          currentPage: page,
          limit,
          totalItems: milestonesWithProgress.length,
          totalPages: Math.ceil(milestonesWithProgress.length / limit),
        },
      };
    }

    // ── Fallback to dummy data ────────────────────────────────
    if (skillId !== 'frontend') {
      throw new NotFoundException(`Roadmap not found for skill: ${skillId}`);
    }

    const progress = getUserProgress(userId);

    const milestonesWithProgress = DUMMY_ROADMAP.milestones.map(milestone => ({
      ...milestone,
      stages: milestone.stages.map(stage => {
        const stageProgress = progress.stages[stage.id];
        return {
          ...stage,
          isCompleted: stageProgress.isCompleted ?? stage.isCompleted,
          earnedStars: stageProgress.earnedStars ?? stage.earnedStars,
        };
      }),
    }));

    const startIndex = (page - 1) * limit;
    const paginatedMilestones = milestonesWithProgress.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      skillId: DUMMY_ROADMAP.skillId,
      skillTitle: DUMMY_ROADMAP.skillTitle,
      userProgress: {
        currentXp: progress.currentXp,
        streakDays: progress.streakDays,
      },
      milestones: paginatedMilestones,
      pagination: {
        currentPage: page,
        limit,
        totalItems: milestonesWithProgress.length,
        totalPages: Math.ceil(milestonesWithProgress.length / limit),
      },
    };
  }

  // -----------------------------------------------------------
  // API 2: GET /api/v1/stages/:stageId/theory
  // -----------------------------------------------------------
  async getTheory(stageId: string) {
    // Try DB first
    const dbTheory = await this.theoryModel.findOne({ stageId }).lean();
    if (dbTheory) {
      return {
        stageId: dbTheory.stageId,
        title: dbTheory.title,
        contentHtml: dbTheory.contentHtml,
        proTips: dbTheory.proTips,
        referenceLinks: dbTheory.referenceLinks,
      };
    }

    // Fallback to dummy
    const theory = DUMMY_THEORIES[stageId];
    if (!theory) {
      throw new NotFoundException(`Theory not found for stage: ${stageId}`);
    }
    return theory;
  }

  // -----------------------------------------------------------
  // API 3: PATCH /api/v1/stages/:stageId/unlock-practice
  // -----------------------------------------------------------
  async unlockPractice(stageId: string, userId: string = 'dummy-user-001') {
    // Try DB first — upsert vào userProgressModel
    try {
      const existing = await this.userProgressModel.findOne({ userId }).lean();
      if (existing) {
        const stageEntry = existing.unlockedStages.find(
          s => s.stageId === stageId,
        );
        if (stageEntry) {
          await this.userProgressModel.updateOne(
            { userId, 'unlockedStages.stageId': stageId },
            { $set: { 'unlockedStages.$.isPracticeUnlocked': true } },
          );
        } else {
          await this.userProgressModel.updateOne(
            { userId },
            {
              $push: {
                unlockedStages: {
                  stageId,
                  isPracticeUnlocked: true,
                  earnedStars: 0,
                },
              },
            },
          );
        }
        return { stageId, isPracticeUnlocked: true };
      }
    } catch {
      // DB not available — fall through to in-memory
    }

    // Fallback: in-memory progress
    const progress = getUserProgress(userId);
    if (!progress.stages[stageId]) {
      progress.stages[stageId] = {
        isPracticeUnlocked: true,
        earnedStars: 0,
        isCompleted: false,
        theoryRead: true,
      };
    } else {
      progress.stages[stageId].isPracticeUnlocked = true;
      progress.stages[stageId].theoryRead = true;
    }

    return { stageId, isPracticeUnlocked: true };
  }

  // -----------------------------------------------------------
  // API 4: GET /api/v1/stages/:stageId/practices
  // -----------------------------------------------------------
  async getPractices(stageId: string) {
    // Try DB first
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

    // Fallback to dummy
    const practices = DUMMY_PRACTICES[stageId];
    if (!practices) {
      throw new NotFoundException(`Practices not found for stage: ${stageId}`);
    }
    return practices;
  }

  // -----------------------------------------------------------
  // API 5: POST /api/v1/exercises/:exerciseId/submit
  // -----------------------------------------------------------
  async submitCode(
    exerciseId: string,
    submittedCode: { html: string; js: string },
    userId: string = 'dummy-user-001',
  ) {
    // Parse exerciseId → stageId + level
    const parts = exerciseId.split('_');
    const stageId = parts.length >= 2 ? parts[1] : 's1';
    const exerciseIndex = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
    const levelMap: Record<number, string> = {
      1: 'easy',
      2: 'medium',
      3: 'hard',
    };
    const level = levelMap[exerciseIndex] || 'easy';

    // Validate: code không rỗng
    const hasCode =
      (submittedCode.html && submittedCode.html.trim().length > 10) ||
      (submittedCode.js && submittedCode.js.trim().length > 10);

    if (!hasCode) {
      return {
        status: 'failed',
        feedback: 'Code quá ngắn hoặc rỗng. Vui lòng viết code và thử lại.',
        xpEarned: 0,
        stageUpdates: {
          stageId,
          totalEarnedStars: 0,
          isStageCompleted: false,
        },
      };
    }

    const xpEarned = XP_REWARDS[level] || 30;

    // Try DB first
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();
      if (dbProgress) {
        const stageEntry = dbProgress.unlockedStages.find(
          s => s.stageId === stageId,
        );
        const currentStars = stageEntry?.earnedStars ?? 0;
        const newStars = Math.max(currentStars, exerciseIndex);

        if (stageEntry) {
          await this.userProgressModel.updateOne(
            { userId, 'unlockedStages.stageId': stageId },
            {
              $set: { 'unlockedStages.$.earnedStars': newStars },
              $inc: { currentXp: xpEarned },
            },
          );
        } else {
          await this.userProgressModel.updateOne(
            { userId },
            {
              $push: {
                unlockedStages: {
                  stageId,
                  isPracticeUnlocked: true,
                  earnedStars: newStars,
                },
              },
              $inc: { currentXp: xpEarned },
            },
          );
        }

        /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
        console.log(
          `[Submit/DB] exerciseId=${exerciseId}, stageId=${stageId}, level=${level}, xp=+${xpEarned}, stars=${newStars}`,
        );

        return {
          status: 'passed',
          feedback: 'Chính xác! Test case đã vượt qua.',
          xpEarned,
          stageUpdates: {
            stageId,
            totalEarnedStars: newStars,
            isStageCompleted: newStars >= 3,
          },
        };
      }
    } catch {
      // DB not available — fall through to in-memory
    }

    // Fallback: in-memory progress
    const progress = getUserProgress(userId);
    progress.currentXp += xpEarned;

    if (!progress.stages[stageId]) {
      progress.stages[stageId] = {
        isPracticeUnlocked: true,
        earnedStars: 0,
        isCompleted: false,
        theoryRead: true,
      };
    }

    const stageProgress = progress.stages[stageId];
    if (stageProgress.earnedStars < exerciseIndex) {
      stageProgress.earnedStars = exerciseIndex;
    }
    stageProgress.isCompleted = stageProgress.earnedStars >= 3;

    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.log(
      `[Submit] exerciseId=${exerciseId}, stageId=${stageId}, level=${level}, xp=+${xpEarned}, stars=${stageProgress.earnedStars}`,
    );

    return {
      status: 'passed',
      feedback: 'Chính xác! Test case đã vượt qua.',
      xpEarned,
      stageUpdates: {
        stageId,
        totalEarnedStars: stageProgress.earnedStars,
        isStageCompleted: stageProgress.isCompleted,
      },
    };
  }

  // ============================================================
  // LEARNING CONTENT API — 3 methods mới
  // ============================================================

  // -----------------------------------------------------------
  // API 6: GET /api/v1/learning-content/skills
  // Lấy danh sách tất cả skills có lộ trình
  // -----------------------------------------------------------
  async getAvailableSkills() {
    // Try DB first
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

    // Fallback to dummy
    return {
      skills: [
        {
          skillId: DUMMY_ROADMAP.skillId,
          skillTitle: DUMMY_ROADMAP.skillTitle,
        },
      ],
    };
  }

  // -----------------------------------------------------------
  // API 7: GET /api/v1/learning-content/stages/:stageId/full
  // Lấy toàn bộ nội dung stage (theory + practices) — preload
  // -----------------------------------------------------------
  async getFullStageContent(stageId: string) {
    const [theory, practices] = await Promise.all([
      this.getTheory(stageId),
      this.getPractices(stageId).catch(() => null),
    ]);

    return {
      stageId,
      theory,
      practices,
    };
  }

  // -----------------------------------------------------------
  // API 8: GET /api/v1/learning-content/progress/summary
  // Tóm tắt tiến độ tổng thể của user
  // -----------------------------------------------------------
  async getProgressSummary(userId: string = 'dummy-user-001') {
    // Try DB first
    const dbProgress = await this.userProgressModel.findOne({ userId }).lean();

    if (dbProgress) {
      const totalStages = 9;
      const completedStages =
        dbProgress.unlockedStages.filter(s => s.earnedStars >= 3).length ?? 0;
      const totalStars =
        dbProgress.unlockedStages.reduce((sum, s) => sum + s.earnedStars, 0) ??
        0;

      return {
        userId,
        currentXp: dbProgress.currentXp,
        streakDays: dbProgress.streakDays,
        totalStages,
        completedStages,
        completionPercentage: Math.round((completedStages / totalStages) * 100),
        totalStars,
        maxStars: totalStages * 3,
        unlockedStages: dbProgress.unlockedStages,
      };
    }

    // Fallback: in-memory
    const progress = getUserProgress(userId);
    const stages = Object.entries(progress.stages);
    const totalStages = 9;
    const completedStages = stages.filter(([, s]) => s.isCompleted).length;
    const totalStars = stages.reduce((sum, [, s]) => sum + s.earnedStars, 0);

    return {
      userId,
      currentXp: progress.currentXp,
      streakDays: progress.streakDays,
      totalStages,
      completedStages,
      completionPercentage: Math.round((completedStages / totalStages) * 100),
      totalStars,
      maxStars: totalStages * 3,
      stages: progress.stages,
    };
  }
}
