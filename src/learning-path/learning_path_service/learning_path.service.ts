import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  LpExerciseDocument,
  RoadmapDocument,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';
import { MilestoneDocument } from '../db_schemas/milestone_schema';
import { TheoryDocument } from '../db_schemas/theory_schema';
import {
  ROADMAPS,
  MILESTONES,
  THEORIES,
  PRACTICES,
  XP_REWARDS,
  getUserProgress,
} from '../seedFiles/learning-data';

@Injectable()
export class LearningPathService {
  private readonly logger: Logger = new Logger(LearningPathService.name);

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

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  private shouldIncrementStreak(lastStreakDate: string | null): boolean {
    return lastStreakDate !== this.getTodayString();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private async findStageContext(stageId: string): Promise<{
    prevStageId: string | null;
    milestoneId: string | null;
    skillId: string;
  }> {
    const dbMilestone = await this.milestoneModel
      .findOne({ 'stages.id': stageId })
      .lean();

    if (dbMilestone) {
      const si = dbMilestone.stages.findIndex(s => s.id === stageId);
      const milestoneId = <string>dbMilestone.id;

      // Look up the roadmap to get skillId (and possibly previous milestone)
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
      return { prevStageId: null, milestoneId, skillId }; // first stage overall
    }

    const allMilestones = MILESTONES;
    for (let mi = 0; mi < allMilestones.length; mi += 1) {
      const m = allMilestones[mi];
      const si = m.stages.findIndex(s => s.id === stageId);
      if (si === -1) continue;
      if (si > 0) {
        return {
          prevStageId: m.stages[si - 1].id,
          milestoneId: m.id,
          skillId: 'frontend',
        };
      }
      if (mi > 0) {
        const prevM = allMilestones[mi - 1];
        return {
          prevStageId: prevM.stages[prevM.stages.length - 1].id,
          milestoneId: m.id,
          skillId: 'frontend',
        };
      }
      return {
        prevStageId: null,
        milestoneId: m.id,
        skillId: 'frontend',
      };
    }

    return { prevStageId: null, milestoneId: null, skillId: 'frontend' };
  }

  private async assertStageAccessible(
    stageId: string,
    userId: string,
  ): Promise<void> {
    const { prevStageId, skillId } = await this.findStageContext(stageId);
    if (!prevStageId) return; // first stage — always accessible

    const dbProgress = await this.userProgressModel
      .findOne({ userId, skillId })
      .lean();
    if (dbProgress) {
      const prev = dbProgress.unlockedStages.find(
        s => s.stageId === prevStageId,
      );
      if ((prev?.earnedStars ?? 0) < 3) {
        throw new ForbiddenException(
          'Complete the previous stage before accessing this one.',
        );
      }
      return;
    }

    const progress = getUserProgress(userId);
    const prev = progress.stages[prevStageId];
    if (!prev.isCompleted) {
      throw new ForbiddenException(
        'Complete the previous stage before accessing this one.',
      );
    }
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
    let totalStages = 0;
    let totalCompleted = 0;
    const milestoneProgress: Record<string, number> = {};

    for (const m of milestones) {
      const stageCount = m.stages.length;
      totalStages += stageCount;
      let completedInMilestone = 0;

      for (const s of m.stages) {
        if ((unlockedMap.get(s.id)?.earnedStars ?? 0) >= 3) {
          completedInMilestone += 1;
          totalCompleted += 1;
        }
      }

      milestoneProgress[m.id] =
        stageCount > 0
          ? Math.round((completedInMilestone / stageCount) * 100)
          : 0;
    }

    const courseProgressPercentage =
      totalStages > 0 ? Math.round((totalCompleted / totalStages) * 100) : 0;

    return { courseProgressPercentage, milestoneProgress };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async getRoadmap(
    skillId: string,
    page: number = 1,
    limit: number = 5,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    // ── DB path ──────────────────────────────────────────────
    const dbRoadmap = await this.roadmapModel.findOne({ skillId }).lean();
    if (dbRoadmap) {
      const rawMilestones = await this.milestoneModel
        .find({ id: { $in: dbRoadmap.milestoneIds } })
        .lean();

      // FIX Bug 1: sort milestones to match the roadmap's declared order
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
          },
        ]),
      );

      const milestonesWithProgress = dbMilestones.map((milestone, index) => {
        const stagesWithProgress = milestone.stages.map(stage => {
          const prog = unlockedMap.get(stage.id);
          const earnedStars = prog?.earnedStars ?? stage.earnedStars;
          return {
            id: stage.id,
            title: stage.title,
            isCompleted: earnedStars >= 3,
            earnedStars,
            stageProgressPercentage: Math.round((earnedStars / 3) * 100),
          };
        });

        const allCompleted = stagesWithProgress.every(s => s.isCompleted);
        const anyProgress = stagesWithProgress.some(s => s.earnedStars > 0);
        // First milestone is always at least in_progress for new users with no history
        let computedStatus: 'locked' | 'in_progress' | 'completed';
        if (allCompleted) {
          computedStatus = 'completed';
        } else if (anyProgress || index === 0) {
          computedStatus = 'in_progress';
        } else {
          computedStatus = 'locked';
        }

        return {
          id: milestone.id,
          title: milestone.title,
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

    // ── Dummy fallback ───────────────────────────────────────
    if (skillId !== 'frontend') {
      throw new NotFoundException(`Roadmap not found for skill: ${skillId}`);
    }

    const progress = getUserProgress(userId);
    const unlockedMap = new Map(
      Object.entries(progress.stages).map(([sid, sp]) => [
        sid,
        {
          earnedStars: sp.earnedStars,
          isPracticeUnlocked: sp.isPracticeUnlocked,
          videoWatchPercentage: sp.videoWatchPercentage,
        },
      ]),
    );

    const milestonesWithProgress = MILESTONES.map((milestone, index) => {
      const stagesWithProgress = milestone.stages.map(stage => {
        const prog = unlockedMap.get(stage.id);
        const earnedStars = prog?.earnedStars ?? stage.earnedStars;
        return {
          id: stage.id,
          title: stage.title,
          isCompleted: earnedStars >= 3,
          earnedStars,
          stageProgressPercentage: Math.round((earnedStars / 3) * 100),
        };
      });

      const allCompleted = stagesWithProgress.every(s => s.isCompleted);
      const anyProgress = stagesWithProgress.some(s => s.earnedStars > 0);
      let computedStatus: 'locked' | 'in_progress' | 'completed';
      if (allCompleted) {
        computedStatus = 'completed';
      } else if (anyProgress || index === 0) {
        computedStatus = 'in_progress';
      } else {
        computedStatus = 'locked';
      }

      return {
        id: milestone.id,
        title: milestone.title,
        status: computedStatus,
        stages: stagesWithProgress,
      };
    });

    const startIndex = (page - 1) * limit;

    return {
      skillId: 'frontend',
      skillTitle: ROADMAPS[0].skillTitle,
      userProgress: {
        currentXp: progress.currentXp,
        streakDays: progress.streakDays,
      },
      milestones: milestonesWithProgress.slice(startIndex, startIndex + limit),
      pagination: {
        currentPage: page,
        limit,
        totalItems: milestonesWithProgress.length,
        totalPages: Math.ceil(milestonesWithProgress.length / limit),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // API 2: GET /api/v1/stages/:stageId/theory
  // ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async getTheory(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    await this.assertStageAccessible(stageId, userId);

    const dbTheory = await this.theoryModel.findOne({ stageId }).lean();
    if (dbTheory) {
      return {
        stageId: dbTheory.stageId,
        title: dbTheory.title,
        contentHtml: dbTheory.contentHtml,
        proTips: dbTheory.proTips,
        videoUrl: (<{ videoUrl?: string }>dbTheory).videoUrl ?? '',
        referenceLinks: dbTheory.referenceLinks,
      };
    }

    const theory = <Record<string, unknown> | undefined>THEORIES[stageId];
    if (!theory) {
      throw new NotFoundException(`Theory not found for stage: ${stageId}`);
    }
    return theory;
  }

  // ──────────────────────────────────────────────────────────
  // API 3: PATCH /api/v1/stages/:stageId/unlock-practice
  // ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async unlockPractice(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    await this.assertStageAccessible(stageId, userId);

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
                  videoWatchPercentage: 0,
                  badgeEarned: false,
                },
              },
            },
          );
        }
        return { stageId, isPracticeUnlocked: true };
      }
    } catch {
      // fall through
    }

    const progress = getUserProgress(userId);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!progress.stages[stageId]) {
      progress.stages[stageId] = {
        isPracticeUnlocked: true,
        earnedStars: 0,
        isCompleted: false,
        theoryRead: true,
        videoWatchPercentage: 0,
      };
    } else {
      progress.stages[stageId].isPracticeUnlocked = true;
      progress.stages[stageId].theoryRead = true;
    }

    return { stageId, isPracticeUnlocked: true };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async getPractices(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
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
    } else {
      const progress = getUserProgress(userId);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!progress.stages[stageId].isPracticeUnlocked) {
        throw new ForbiddenException(
          'Complete the theory section before accessing practices.',
        );
      }
    }

    const practices = PRACTICES[stageId];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!practices) {
      throw new NotFoundException(`Practices not found for stage: ${stageId}`);
    }
    return practices;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering, sonarjs/cognitive-complexity
  async submitCode(
    exerciseId: string,
    submittedCode: { html: string; js: string },
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const parts = exerciseId.split('_');
    const stageId = parts.length >= 2 ? parts[1] : 's1';
    const exerciseIndex = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
    const levelMap: Record<number, string> = {
      1: 'easy',
      2: 'medium',
      3: 'hard',
    };
    const level = levelMap[exerciseIndex] || 'easy';

    const hasCode =
      (submittedCode.html && submittedCode.html.trim().length > 10) ||
      (submittedCode.js && submittedCode.js.trim().length > 10);

    if (!hasCode) {
      return {
        status: 'failed',
        feedback: 'Code quá ngắn hoặc rỗng. Vui lòng viết code và thử lại.',
        xpEarned: 0,
        streakIncremented: false,
        badgeEarned: <string | null>null,
        stageUpdates: { stageId, totalEarnedStars: 0, isStageCompleted: false },
      };
    }

    const xpEarned = XP_REWARDS[level] || 30;

    // FIX Bug 2: resolve milestoneId for resume state update
    const { milestoneId } = await this.findStageContext(stageId);

    // ── DB path ─────────────────────────────────────────────
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
        const isNowCompleted = newStars >= 3;

        // Streak: first exercise of the day only
        const streakIncremented = this.shouldIncrementStreak(
          dbProgress.lastStreakDate,
        );
        const newStreakDays = streakIncremented
          ? dbProgress.streakDays + 1
          : dbProgress.streakDays;

        // Badge: when stage first reaches completion
        const wasPreviouslyCompleted = currentStars >= 3;
        const badgeEarned =
          isNowCompleted && !wasPreviouslyCompleted && !stageEntry?.badgeEarned
            ? stageId
            : null;

        // FIX Bug 2: include lastActiveMilestoneId in the $set
        const topLevelSet: Record<string, unknown> = {
          lastActiveStageId: stageId,
          ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
          ...(streakIncremented && {
            streakDays: newStreakDays,
            lastStreakDate: this.getTodayString(),
          }),
        };

        const stageUpdate = stageEntry
          ? {
              filter: { userId, 'unlockedStages.stageId': stageId },
              update: {
                $inc: { currentXp: xpEarned },
                $set: {
                  ...topLevelSet,
                  'unlockedStages.$.earnedStars': newStars,
                  ...(badgeEarned && { 'unlockedStages.$.badgeEarned': true }),
                },
                ...(badgeEarned && { $push: { badges: stageId } }),
              },
            }
          : {
              filter: { userId },
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

        await this.userProgressModel.updateOne(
          stageUpdate.filter,
          stageUpdate.update,
        );

        /* eslint no-console: ["error", { allow: ["log"] }] */
        console.log(
          `[Submit/DB] exerciseId=${exerciseId} stage=${stageId} milestone=${milestoneId ?? '?'} level=${level} xp=+${xpEarned} stars=${newStars} streak=${streakIncremented ? '+1' : '='} badge=${badgeEarned ?? 'none'}`,
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
      // DB not available — fall through
    }

    // ── Dummy fallback ───────────────────────────────────────
    const progress = getUserProgress(userId);
    progress.currentXp += xpEarned;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, sonarjs/different-types-comparison
    if (progress.stages[stageId] === undefined) {
      progress.stages[stageId] = {
        isPracticeUnlocked: true,
        earnedStars: 0,
        isCompleted: false,
        theoryRead: true,
        videoWatchPercentage: 0,
      };
    }

    const stageProgress = progress.stages[stageId];
    const wasPreviouslyCompleted = stageProgress.isCompleted;

    if (stageProgress.earnedStars < exerciseIndex) {
      stageProgress.earnedStars = exerciseIndex;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, sonarjs/different-types-comparison
    stageProgress.isCompleted = stageProgress.earnedStars >= 3;

    // Streak
    const streakIncremented = this.shouldIncrementStreak(
      progress.lastStreakDate,
    );
    if (streakIncremented) {
      progress.streakDays += 1;
      progress.lastStreakDate = this.getTodayString();
    }

    // Badge
    let badgeEarned: string | null;
    if (stageProgress.isCompleted && !wasPreviouslyCompleted) {
      badgeEarned = stageId;
    } else {
      badgeEarned = null;
    }
    if (badgeEarned && !progress.badges.includes(stageId)) {
      progress.badges.push(stageId);
    }

    // FIX Bug 2: set lastActiveMilestoneId in dummy path
    progress.lastActiveStageId = stageId;
    if (milestoneId) progress.lastActiveMilestoneId = milestoneId;

    console.log(
      `[Submit] exerciseId=${exerciseId} stage=${stageId} milestone=${milestoneId ?? '?'} level=${level} xp=+${xpEarned} stars=${stageProgress.earnedStars} streak=${streakIncremented ? '+1' : '='} badge=${badgeEarned ?? 'none'}`,
    );

    return {
      status: 'passed',
      feedback: 'Chính xác! Test case đã vượt qua.',
      xpEarned,
      streakIncremented,
      badgeEarned,
      stageUpdates: {
        stageId,
        totalEarnedStars: stageProgress.earnedStars,
        isStageCompleted: stageProgress.isCompleted,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering, sonarjs/cognitive-complexity
  async updateVideoProgress(
    stageId: string,
    watchPercentage: number,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const clampedPct = Math.min(100, Math.max(0, watchPercentage));
    const VIDEO_XP_THRESHOLD = 80;

    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (dbProgress) {
        const stageEntry = dbProgress.unlockedStages.find(
          s => s.stageId === stageId,
        );
        const prevPct = stageEntry?.videoWatchPercentage ?? 0;
        const crossesThreshold =
          prevPct < VIDEO_XP_THRESHOLD && clampedPct >= VIDEO_XP_THRESHOLD;
        const xpEarned = crossesThreshold ? XP_REWARDS.videoIntro : 0;

        if (stageEntry) {
          await this.userProgressModel.updateOne(
            { userId, 'unlockedStages.stageId': stageId },
            {
              $set: { 'unlockedStages.$.videoWatchPercentage': clampedPct },
              ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
            },
          );
        } else {
          await this.userProgressModel.updateOne(
            { userId },
            {
              $push: {
                unlockedStages: {
                  stageId,
                  isPracticeUnlocked: false,
                  earnedStars: 0,
                  videoWatchPercentage: clampedPct,
                  badgeEarned: false,
                },
              },
              ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
            },
          );
        }

        return {
          stageId,
          videoWatchPercentage: clampedPct,
          xpEarned,
          thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
        };
      }

      // FIX Bug 3: no progress document exists yet — resolve skillId and upsert
      const { skillId } = await this.findStageContext(stageId);
      const xpEarned =
        clampedPct >= VIDEO_XP_THRESHOLD ? XP_REWARDS.videoIntro : 0;

      await this.userProgressModel.updateOne(
        { userId, skillId },
        {
          $setOnInsert: {
            userId,
            skillId,
            currentXp: 0,
            streakDays: 0,
            lastStreakDate: null,
            badges: [],
            lastActiveStageId: null,
            lastActiveMilestoneId: null,
            placementTestCompleted: false,
            skipToMilestoneId: null,
          },
          $push: {
            unlockedStages: {
              stageId,
              isPracticeUnlocked: false,
              earnedStars: 0,
              videoWatchPercentage: clampedPct,
              badgeEarned: false,
            },
          },
          ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
        },
        { upsert: true },
      );

      return {
        stageId,
        videoWatchPercentage: clampedPct,
        xpEarned,
        thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
      };
    } catch {
      // fall through to dummy
    }

    const progress = getUserProgress(userId);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!progress.stages[stageId]) {
      progress.stages[stageId] = {
        isPracticeUnlocked: false,
        earnedStars: 0,
        isCompleted: false,
        theoryRead: false,
        videoWatchPercentage: 0,
      };
    }

    const sp = progress.stages[stageId];
    const crossesThreshold =
      sp.videoWatchPercentage < VIDEO_XP_THRESHOLD &&
      clampedPct >= VIDEO_XP_THRESHOLD;
    const xpEarned = crossesThreshold ? XP_REWARDS.videoIntro : 0;

    sp.videoWatchPercentage = clampedPct;
    if (xpEarned > 0) progress.currentXp += xpEarned;

    return {
      stageId,
      videoWatchPercentage: clampedPct,
      xpEarned,
      thresholdReached: clampedPct >= VIDEO_XP_THRESHOLD,
    };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering, sonarjs/cognitive-complexity
  async syncPlacementTest(
    skipToMilestoneId: string,
    userId: string = 'dummy-user-001',
    skillId: string = 'frontend',
  ): Promise<unknown> {
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

    // Dummy fallback
    const dummyMilestones = MILESTONES;
    const dummySkipIndex = dummyMilestones.findIndex(
      m => m.id === skipToMilestoneId,
    );
    const progress = getUserProgress(userId);

    if (dummySkipIndex > 0) {
      for (let mi = 0; mi < dummySkipIndex; mi += 1) {
        for (const s of dummyMilestones[mi].stages) {
          if (!completedStageIds.includes(s.id)) completedStageIds.push(s.id);
          progress.stages[s.id] = {
            isPracticeUnlocked: true,
            earnedStars: 3,
            isCompleted: true,
            theoryRead: true,
            videoWatchPercentage: 100,
          };
        }
      }
      progress.badges = [
        ...new Set([...progress.badges, ...completedStageIds]),
      ];
    }

    return {
      success: true,
      placementTestCompleted: true,
      skipToMilestoneId,
      unlockedStagesCount: completedStageIds.length,
    };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering, sonarjs/cognitive-complexity
  async completeStage(
    stageId: string,
    userId: string = 'dummy-user-001',
  ): Promise<unknown> {
    const { milestoneId } = await this.findStageContext(stageId);

    let badgeIcon = '';
    if (milestoneId) {
      const parentMilestone = await this.milestoneModel
        .findOne({ id: milestoneId })
        .lean();
      if (parentMilestone) {
        const stageDoc = parentMilestone.stages.find(s => s.id === stageId);
        badgeIcon =
          (<{ icon?: string }>stageDoc).icon ||
          (<{ icon?: string }>parentMilestone).icon ||
          '';
      }
    }

    // ── DB path ─────────────────────────────────────────────
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();
      if (dbProgress) {
        const stageEntry = dbProgress.unlockedStages.find(
          s => s.stageId === stageId,
        );
        const isStageComplete = (stageEntry?.earnedStars ?? 0) >= 3;
        const alreadyBadged = !!stageEntry?.badgeEarned;

        const streakIncremented = this.shouldIncrementStreak(
          dbProgress.lastStreakDate,
        );
        const newStreakDays = streakIncremented
          ? dbProgress.streakDays + 1
          : dbProgress.streakDays;

        const awardBadge = isStageComplete && !alreadyBadged;

        const topLevelSet: Record<string, unknown> = {
          lastActiveStageId: stageId,
          ...(milestoneId && { lastActiveMilestoneId: milestoneId }),
          ...(streakIncremented && {
            streakDays: newStreakDays,
            lastStreakDate: this.getTodayString(),
          }),
        };

        if (stageEntry) {
          await this.userProgressModel.updateOne(
            { userId, 'unlockedStages.stageId': stageId },
            {
              $set: {
                ...topLevelSet,
                ...(awardBadge && { 'unlockedStages.$.badgeEarned': true }),
              },
              ...(awardBadge && { $push: { badges: stageId } }),
            },
          );
        } else {
          await this.userProgressModel.updateOne(
            { userId },
            {
              $set: topLevelSet,
              $push: {
                unlockedStages: {
                  stageId,
                  isPracticeUnlocked: false,
                  earnedStars: 0,
                  videoWatchPercentage: 0,
                  badgeEarned: false,
                },
              },
            },
          );
        }

        return {
          stageId,
          streakIncremented,
          newStreakDays,
          badgeEarned: awardBadge ? { stageId, icon: badgeIcon } : null,
          isStageComplete,
        };
      }
    } catch {
      // noop
    }

    const progress = getUserProgress(userId);
    const sp = progress.stages[stageId];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const isStageComplete = (sp.earnedStars ?? 0) >= 3;
    const alreadyBadged = progress.badges.includes(stageId);

    const streakIncremented = this.shouldIncrementStreak(
      progress.lastStreakDate,
    );
    if (streakIncremented) {
      progress.streakDays += 1;
      progress.lastStreakDate = this.getTodayString();
    }

    const awardBadge = isStageComplete && !alreadyBadged;
    if (awardBadge) progress.badges.push(stageId);

    progress.lastActiveStageId = stageId;
    if (milestoneId) progress.lastActiveMilestoneId = milestoneId;

    return {
      stageId,
      streakIncremented,
      newStreakDays: progress.streakDays,
      badgeEarned: awardBadge ? { stageId, icon: badgeIcon } : null,
      isStageComplete,
    };
  }

  // ──────────────────────────────────────────────────────────
  // GET /api/v1/learning-content/skills
  // ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/member-ordering
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

    return {
      skills: [
        {
          skillId: 'frontend',
          skillTitle: ROADMAPS[0].skillTitle,
        },
      ],
    };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
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

  // eslint-disable-next-line @typescript-eslint/member-ordering
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

    const progress = getUserProgress(userId);
    const allMilestones = MILESTONES;
    const unlockedMap = new Map(
      Object.entries(progress.stages).map(([sid, sp]) => [
        sid,
        {
          earnedStars: sp.earnedStars,
          isPracticeUnlocked: sp.isPracticeUnlocked,
          videoWatchPercentage: sp.videoWatchPercentage,
        },
      ]),
    );

    const { courseProgressPercentage, milestoneProgress } =
      this.computeProgress(allMilestones, unlockedMap);

    return {
      userId,
      currentXp: progress.currentXp,
      streakDays: progress.streakDays,
      badges: progress.badges,
      lastActiveStageId: progress.lastActiveStageId,
      lastActiveMilestoneId: progress.lastActiveMilestoneId,
      courseProgressPercentage,
      totalStages: allMilestones.reduce((sum, m) => sum + m.stages.length, 0),
      completedStages: Object.values(progress.stages).filter(s => s.isCompleted)
        .length,
      milestoneProgress,
      stages: progress.stages,
    };
  }
}
