import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { canonicalLessonIdToStageId } from './canonical-utils';
import { CanonicalMap } from '../../entrance-test/db_schemas/canonical-map.schema';
import { EntranceTest } from '../../entrance-test/db_schemas/entrance-test.schema';
import {
  Question,
  EntranceTestData,
  CriticalGateRule,
  AdvancementLevel,
  ScoreResult,
  CompetencyResult,
  WeakArea,
  PlacementResult,
  LearningPathLesson,
  CanonicalMapData,
} from '../../entrance-test/entrance-test.types';
import { UserLearningProgressDocument } from '../db_schemas/learning_path_schemas';
import { ActivityType } from '@/users/schemas/activity-log.schema';
import { GamificationService } from '@/users/services/gamification.service';

@Injectable()
export class PlacementService {
  constructor(
    @InjectModel(EntranceTest.name)
    private readonly entranceTestModel: Model<EntranceTest>,
    @InjectModel(CanonicalMap.name)
    private readonly canonicalMapModel: Model<CanonicalMap>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
    private readonly gamificationService: GamificationService,
  ) {}

  async calculateScore(studentAnswers: Record<string, string>): Promise<{
    scoreResult: ScoreResult;
    competencies: CompetencyResult;
    correctAnswers: Set<number>;
  }> {
    const data = <EntranceTestData>(
      await this.entranceTestModel.findOne().lean().exec()
    );
    const { questions, difficultyWeight, questionMapping } = data;
    let earnedScore = 0;
    let maxScore = 0;
    const correctAnswers = new Set<number>();

    for (const question of questions) {
      const weight =
        Object.values(difficultyWeight).find(dw =>
          dw.questions.includes(question.id),
        )?.weight || 1;
      maxScore += weight;

      if (studentAnswers[String(question.id)] === question.correctAnswer) {
        earnedScore += weight;
        correctAnswers.add(question.id);
      }
    }

    const competencies: CompetencyResult = {};
    for (const [competency, ids] of Object.entries(questionMapping)) {
      const competencyQuestions = questions.filter(q => ids.includes(q.id));
      const correctCompetency = competencyQuestions.filter(q =>
        correctAnswers.has(q.id),
      ).length;
      competencies[competency] =
        competencyQuestions.length > 0
          ? (correctCompetency / competencyQuestions.length) * 100
          : 0;
    }

    return {
      scoreResult: {
        earned: earnedScore,
        max: maxScore,
        percentage: maxScore > 0 ? (earnedScore / maxScore) * 100 : 0,
      },
      competencies,
      correctAnswers,
    };
  }

  async checkCriticalGates(
    competencies: CompetencyResult,
  ): Promise<{ status: 'PASS' | 'FAIL'; failReason?: string }> {
    const data = <EntranceTestData>(
      await this.entranceTestModel.findOne().lean().exec()
    );
    for (const rule of <CriticalGateRule[]>data.criticalGateRules) {
      if ((competencies[rule.competency] || 0) < rule.minPercentage) {
        return { status: 'FAIL', failReason: rule.failReason };
      }
    }
    return { status: 'PASS' };
  }

  async getAdvancementLevel(percentage: number): Promise<AdvancementLevel> {
    const data = <EntranceTestData>(
      await this.entranceTestModel.findOne().lean().exec()
    );
    for (const level of <AdvancementLevel[]>data.advancementLevels) {
      if (percentage >= level.min && percentage <= level.max) {
        return level;
      }
    }
    return <AdvancementLevel>(
      data.advancementLevels[data.advancementLevels.length - 1]
    );
  }

  async detectWeakAreas(correctAnswers: Set<number>): Promise<WeakArea[]> {
    const data = <EntranceTestData>(
      await this.entranceTestModel.findOne().lean().exec()
    );
    const canonicalData = <CanonicalMapData>(
      await this.canonicalMapModel.findOne().lean().exec()
    );
    const weakAreas: WeakArea[] = [];

    for (const question of <Question[]>data.questions) {
      if (correctAnswers.has(question.id)) continue;

      const existingWeakArea = weakAreas.find(w => w.topic === question.topic);
      if (existingWeakArea) {
        existingWeakArea.questions.push(question.id);
        continue;
      }

      const matchedEntry = Object.values(canonicalData.map).find(entry =>
        entry.questionIds.includes(question.id),
      );

      weakAreas.push({
        topic: question.topic,
        questions: [question.id],
        recommendedExerciseId: matchedEntry?.exerciseId,
      });
    }
    return weakAreas;
  }

  async processPlacement(
    studentAnswers: Record<string, string>,
  ): Promise<PlacementResult> {
    const { scoreResult, competencies, correctAnswers } =
      await this.calculateScore(studentAnswers);
    const gateCheck = await this.checkCriticalGates(competencies);
    const advancementLevel = await this.getAdvancementLevel(
      scoreResult.percentage,
    );
    const weakAreas = await this.detectWeakAreas(correctAnswers);
    const canonicalData = <CanonicalMapData>(
      await this.canonicalMapModel.findOne().lean().exec()
    );

    const recommendedLessons = weakAreas
      .map(w => {
        const match = Object.entries(canonicalData.map).find(
          ([, entry]) => entry.exerciseId === w.recommendedExerciseId,
        );
        return match?.[0] ?? null;
      })
      .filter((id): id is string => Boolean(id));

    const autoPassedExercises: string[] = [];
    for (const entry of Object.values(canonicalData.map)) {
      const allCorrect = entry.questionIds.every(id => correctAnswers.has(id));
      if (allCorrect) {
        autoPassedExercises.push(entry.exerciseId);
      }
    }

    const unlockedMilestones = ['m1'];
    if (scoreResult.percentage >= 50) unlockedMilestones.push('m2');
    if (scoreResult.percentage >= 80) unlockedMilestones.push('m3');

    const advancement = this.resolveSkipMilestone(
      advancementLevel,
      gateCheck,
      competencies,
    );

    return {
      score: scoreResult,
      competencies,
      level: advancementLevel.label,
      status: gateCheck.status,
      advancement: {
        canAdvance: advancement.canAdvance,
        nextMilestone: advancement.nextMilestone,
      },
      weakAreas,
      recommendedLessons,
      studyPlan:
        weakAreas.length > 0
          ? [`Focus on: ${weakAreas.map(w => w.topic).join(', ')}`]
          : ['Great job! Continue with the next lessons.'],
      autoPassedExercises,
      unlockedMilestones,
      failReason: gateCheck.failReason,
      studentAnswers,
      skipToMilestoneId: advancement.skipToMilestoneId,
    };
  }

  async syncPlacementTest(
    skipToMilestoneId: string,
    userId: string,
    skillId: string,
    learningPath?: LearningPathLesson[],
    studyPlan?: string[],
  ): Promise<{
    placementTestCompleted: boolean;
    skipToMilestoneId: string;
    studyPlan: string[];
    xpEarned: number;
    autoPassedCount: number;
  }> {
    if (!userId) {
      return {
        placementTestCompleted: false,
        skipToMilestoneId,
        studyPlan: studyPlan ?? [],
        xpEarned: 0,
        autoPassedCount: 0,
      };
    }

    const canonicalData = <CanonicalMapData>(
      await this.canonicalMapModel.findOne().lean().exec()
    );

    const unlockedStages: UserLearningProgressDocument['unlockedStages'] = [];
    let xpEarned = 0;
    let autoPassedCount = 0;

    if (learningPath?.length) {
      for (const lesson of learningPath) {
        const stageId =
          lesson.stageId ||
          canonicalLessonIdToStageId(lesson.canonicalLessonId, canonicalData);

        if (lesson.status === 'auto_passed') {
          autoPassedCount += 1;

          const lessonResult = await this.gamificationService.addXp(
            userId,
            ActivityType.LESSON_COMPLETED,
            stageId,
          );
          const stageResult = await this.gamificationService.addXp(
            userId,
            ActivityType.STAGE_COMPLETED,
            stageId,
          );
          xpEarned += lessonResult.xpEarned + stageResult.xpEarned;

          unlockedStages.push({
            stageId,
            theoryCompleted: true,
            theoryXpAwarded: true,
            isPracticeUnlocked: true,
            earnedStars: 3,
            hasSubmittedExercise: true,
            videoWatchPercentage: 100,
            videoSeekPercentage: 0,
            badgeEarned: false,
          });
        } else if (lesson.status === 'required') {
          unlockedStages.push({
            stageId,
            theoryCompleted: false,
            theoryXpAwarded: false,
            isPracticeUnlocked: false,
            earnedStars: 0,
            hasSubmittedExercise: false,
            videoWatchPercentage: 0,
            videoSeekPercentage: 0,
            badgeEarned: false,
          });
          break;
        }
      }
    }

    const personalizedLearningPath =
      learningPath?.map(lesson => ({
        canonicalLessonId: lesson.canonicalLessonId,
        stageId:
          lesson.stageId ||
          canonicalLessonIdToStageId(lesson.canonicalLessonId, canonicalData),
        exerciseId: lesson.exerciseId,
        status: lesson.status,
      })) ?? [];

    await this.userProgressModel.findOneAndUpdate(
      { userId, skillId },
      {
        $set: {
          placementTestCompleted: true,
          skipToMilestoneId,
          personalizedLearningPath,
          studyPlan: studyPlan ?? [],
          unlockedStages,
        },
        ...(xpEarned > 0 && { $inc: { currentXp: xpEarned } }),
      },
      { upsert: true, new: true },
    );

    return {
      placementTestCompleted: true,
      skipToMilestoneId,
      studyPlan: studyPlan ?? [],
      xpEarned,
      autoPassedCount,
    };
  }

  async resetPlacementProgress(
    userId: string,
    skillId: string,
  ): Promise<boolean> {
    const progress = await this.userProgressModel
      .findOne({ userId, skillId })
      .exec();

    if (!progress) return false;

    if (progress.currentXp > 0) {
      await this.gamificationService.deductXp(userId, progress.currentXp);
    }

    progress.currentXp = 0;
    progress.placementTestCompleted = false;
    progress.skipToMilestoneId = null;
    progress.unlockedStages = [];
    progress.personalizedLearningPath = [];
    progress.studyPlan = [];
    progress.lastActiveStageId = null;
    progress.lastActiveMilestoneId = null;

    await progress.save();
    return true;
  }

  private resolveSkipMilestone(
    advancementLevel: AdvancementLevel,
    gateCheck: { status: 'PASS' | 'FAIL' },
    competencies: CompetencyResult,
  ): {
    canAdvance: boolean;
    nextMilestone?: string;
    skipToMilestoneId: string;
  } {
    const action = advancementLevel.action;
    let skipToMilestoneId = 'm1';
    let canAdvance = false;
    let nextMilestone: string | undefined;

    const meetsCompetencyRequirements = (): boolean => {
      if (!advancementLevel.requiresCompetency) return true;
      return Object.entries(advancementLevel.requiresCompetency).every(
        ([comp, min]) => (competencies[comp] || 0) >= min,
      );
    };

    const meetsGateRequirements = (): boolean => {
      if (advancementLevel.requiresAllGatesPass) {
        return gateCheck.status === 'PASS';
      }
      return true;
    };

    if (action.includes('Milestone 2')) {
      if (meetsCompetencyRequirements() && gateCheck.status === 'PASS') {
        canAdvance = true;
        nextMilestone = 'm2';
        skipToMilestoneId = 'm2';
      }
    } else if (action.includes('Milestone 3') || action === 'Fast Track') {
      if (meetsGateRequirements()) {
        canAdvance = true;
        nextMilestone = 'm3';
        skipToMilestoneId = 'm3';
      }
    }

    return { canAdvance, nextMilestone, skipToMilestoneId };
  }
}
