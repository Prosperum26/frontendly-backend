import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChallengeExercise, ChallengeExerciseDocument } from './db_schemas/challenge.schema';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(ChallengeExercise.name)
    private challengeExerciseModel: Model<ChallengeExerciseDocument>,
  ) {}

  async getChallenges(): Promise<ChallengeExercise[]> {
    return this.challengeExerciseModel.find().exec();
  }

  async getChallengeById(id: string): Promise<ChallengeExercise | null> {
    return this.challengeExerciseModel.findOne({ id }).exec();
  }
}
