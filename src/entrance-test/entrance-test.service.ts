import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntranceTestQuestion, EntranceTestQuestionDocument } from './db_schemas/entrance-test.schema';

@Injectable()
export class EntranceTestService {
  constructor(
    @InjectModel(EntranceTestQuestion.name)
    private entranceTestQuestionModel: Model<EntranceTestQuestionDocument>,
  ) {}

  async getQuestions(): Promise<EntranceTestQuestion[]> {
    return this.entranceTestQuestionModel.find().exec();
  }

  submitTest(
    _userId: string,
    _answers: Record<string, unknown>,
  ): { skipToMilestoneId: string } {
    return { skipToMilestoneId: 'm1' };
  }
}
