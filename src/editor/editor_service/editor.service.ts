import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';

@Injectable()
export class EditorService {
  constructor(
    @InjectModel('Exercise')
    private readonly exerciseModel: Model<ExerciseDocument>,
  ) {}

  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .select('-_id')
      .lean();
    if (!exercise) {
      throw new NotFoundException('Cannot find exercise');
    }
    return exercise;
  }
}
