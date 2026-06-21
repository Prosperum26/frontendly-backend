import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { canonicalLessonIdToStageId } from './canonical-utils';
import { CanonicalMap } from '../../entrance-test/db_schemas/canonical-map.schema';
import { CourseTheory } from '../../entrance-test/db_schemas/course-theory.schema';
import { EntranceTest } from '../../entrance-test/db_schemas/entrance-test.schema';
import {
  CanonicalMapData,
  CriticalGateRule,
  PlacementResult,
  LearningPathLesson,
  PersonalizedPathResult,
  CompetencyResult,
  TheoryData,
  LessonStatus,
} from '../../entrance-test/entrance-test.types';

@Injectable()
export class PathBuilderService {
  constructor(
    @InjectModel(CanonicalMap.name)
    private readonly canonicalMapModel: Model<CanonicalMap>,
    @InjectModel(CourseTheory.name)
    private readonly courseTheoryModel: Model<CourseTheory>,
    @InjectModel(EntranceTest.name)
    private readonly entranceTestModel: Model<EntranceTest>,
  ) {}

  async buildPersonalizedPath(
    userId: string,
    placementResult: PlacementResult,
  ): Promise<PersonalizedPathResult> {
    const [canonicalData, theoryData, entranceData] = await Promise.all([
      this.canonicalMapModel.findOne().lean().exec(),
      this.courseTheoryModel.findOne().lean().exec(),
      this.entranceTestModel.findOne().lean().exec(),
    ]);

    if (!canonicalData || !theoryData) {
      throw new Error('Canonical map or course theory data is not seeded');
    }

    const typedCanonicalData = <CanonicalMapData>canonicalData;
    const typedTheoryData = <TheoryData>theoryData;

    const correctAnswers = new Map<number, string>(
      (entranceData?.questions ?? []).map(
        (q: { id: number; correctAnswer: string }) => [q.id, q.correctAnswer],
      ),
    );
    const criticalGates = <CriticalGateRule[]>(
      (entranceData?.criticalGateRules ?? [])
    );

    const allLessons = typedTheoryData.milestones.flatMap(m =>
      m.lessons.map(l => ({ ...l, milestoneId: m.milestoneId })),
    );
    const learningPath: LearningPathLesson[] = [];

    for (const canonicalLessonId of typedCanonicalData.order) {
      const mapEntry = typedCanonicalData.map[canonicalLessonId];
      if (!mapEntry) continue;

      const lesson = allLessons.find(l => l.lessonId === canonicalLessonId);
      const competencyMastery = this.getLessonCompetencyMastery(
        mapEntry.milestoneId,
        placementResult.competencies,
      );
      const previousGatesPassed = this.arePreviousMilestoneGatesPassed(
        mapEntry.milestoneId,
        placementResult.competencies,
        typedCanonicalData,
        criticalGates,
      );

      let status: LessonStatus;
      if (!previousGatesPassed) {
        status = 'locked';
      } else if (
        this.isLessonAutoPassed(
          mapEntry.questionIds,
          placementResult.studentAnswers || {},
          correctAnswers,
          competencyMastery,
          previousGatesPassed,
        )
      ) {
        status = 'auto_passed';
      } else {
        status = 'required';
      }

      learningPath.push({
        canonicalLessonId,
        stageId: canonicalLessonIdToStageId(
          canonicalLessonId,
          typedCanonicalData,
        ),
        milestoneId: mapEntry.milestoneId,
        title: lesson?.title || mapEntry.title,
        exerciseId: mapEntry.exerciseId,
        status,
      });
    }

    return {
      userId,
      placementSummary: {
        level: placementResult.level,
        status: placementResult.status,
        percentage: placementResult.score.percentage,
      },
      learningPath,
      studyPlan: this.generateStudyPlan(learningPath, placementResult),
    };
  }

  private getLessonCompetencyMastery(
    milestoneId: string,
    competencies: CompetencyResult,
  ): number {
    if (milestoneId === 'm1') return competencies.foundation || 0;
    if (milestoneId === 'm2') return competencies.styling || 0;
    if (milestoneId === 'm3') {
      return ((competencies.component || 0) + (competencies.state || 0)) / 2;
    }
    return 0;
  }

  private arePreviousMilestoneGatesPassed(
    milestoneId: string,
    competencies: CompetencyResult,
    canonicalData: CanonicalMapData,
    criticalGates: CriticalGateRule[],
  ): boolean {
    const milestoneOrder = ['m1', 'm2', 'm3'];
    const currentIndex = milestoneOrder.indexOf(milestoneId);
    if (currentIndex <= 0) return true;

    for (let i = 0; i < currentIndex; i++) {
      const prevMilestoneId = milestoneOrder[i];
      const gateIds =
        canonicalData.milestoneToCriticalGate[prevMilestoneId] || [];
      for (const gateId of gateIds) {
        const rule = criticalGates.find(r => r.id === gateId);
        if (!rule) continue;
        if ((competencies[rule.competency] || 0) < rule.minPercentage) {
          return false;
        }
      }
    }
    return true;
  }

  private isLessonAutoPassed(
    questionIds: number[],
    studentAnswers: Record<string, string>,
    correctAnswers: Map<number, string>,
    competencyMastery: number,
    previousGatesPassed: boolean,
  ): boolean {
    const allRelatedQuestionsCorrect = questionIds.every(
      id => studentAnswers[String(id)] === correctAnswers.get(id),
    );
    return (
      allRelatedQuestionsCorrect &&
      competencyMastery >= 70 &&
      previousGatesPassed
    );
  }

  private generateStudyPlan(
    learningPath: LearningPathLesson[],
    placementResult: PlacementResult,
  ): string[] {
    const plan: string[] = [];
    const requiredLesson = learningPath.find(l => l.status === 'required');
    if (placementResult.weakAreas.length > 0) {
      plan.push(
        `Focus on: ${placementResult.weakAreas.map(w => w.topic).join(', ')}`,
      );
    }
    if (requiredLesson) {
      plan.push(`Next lesson: ${requiredLesson.title}`);
    } else {
      plan.push('Excellent! All lessons are auto-passed!');
    }
    if (placementResult.status === 'FAIL' && placementResult.failReason) {
      plan.push(`Note: ${placementResult.failReason}`);
    }
    return plan;
  }
}
