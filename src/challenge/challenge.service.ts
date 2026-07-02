import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ChallengeExercise } from './challenge.types';
import {
  Exercise,
  ExerciseDocument,
} from '../editor/db_schemas/exercise_schema';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Exercise.name)
    private readonly exerciseModel: Model<ExerciseDocument>,
  ) {}

  async getExercises(): Promise<ChallengeExercise[]> {
    const challenges = await this.exerciseModel
      .find({ module: 'frontend:challenge' })
      .select('id title level description tags target_url')
      .lean();

    return challenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: <'easy' | 'medium' | 'hard'>(<string>challenge.level),
      tags: challenge.tags || [],
      previewImage: challenge.target_url || '',
    }));
  }
}
