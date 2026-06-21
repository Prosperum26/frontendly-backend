import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EntranceTest } from './db_schemas/entrance-test.schema';
import {
  EntranceTestQuestion,
  EntranceTestResult,
  EntranceTestData,
  PersonalizedPathResult,
} from './entrance-test.types';
import { PathBuilderService } from '../learning-path/learning_path_service/path-builder.service';
import { PlacementService } from '../learning-path/learning_path_service/placement.service';

@Injectable()
export class EntranceTestService {
  constructor(
    @InjectModel(EntranceTest.name)
    private readonly entranceTestModel: Model<EntranceTest>,
    private readonly placementService: PlacementService,
    private readonly pathBuilderService: PathBuilderService,
  ) {}

  async getQuestions(): Promise<EntranceTestQuestion[]> {
    const testData = <EntranceTestData>(
      await this.entranceTestModel.findOne().lean().exec()
    );
    return testData.questions.map(question => ({
      id: String(question.id),
      question: question.question,
      type: <EntranceTestQuestion['type']>'single-choice',
      options: Object.values(question.options),
    }));
  }

  async submit(
    studentAnswers: Record<string, string>,
    userId?: string,
  ): Promise<EntranceTestResult> {
    const testData = <EntranceTestData>(
      await this.entranceTestModel.findOne().lean().exec()
    );
    const placementResult =
      await this.placementService.processPlacement(studentAnswers);

    const correctCount = testData.questions.filter(
      q => studentAnswers[String(q.id)] === q.correctAnswer,
    ).length;

    const skipToMilestoneId =
      placementResult.skipToMilestoneId ||
      (placementResult.advancement.canAdvance &&
      placementResult.advancement.nextMilestone
        ? placementResult.advancement.nextMilestone
        : 'm1');

    const personalizedPath =
      await this.pathBuilderService.buildPersonalizedPath(
        userId || 'guest',
        placementResult,
      );

    return {
      skipToMilestoneId,
      skillId: 'frontend',
      score: correctCount,
      totalQuestions: testData.questions.length,
      placementResult,
      personalizedPath,
    };
  }

  async getPersonalizedPath(
    userId: string,
    studentAnswers: Record<string, string>,
  ): Promise<PersonalizedPathResult> {
    const placementResult =
      await this.placementService.processPlacement(studentAnswers);
    return this.pathBuilderService.buildPersonalizedPath(
      userId,
      placementResult,
    );
  }
}
