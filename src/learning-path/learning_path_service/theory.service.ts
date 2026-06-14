import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TheoryDocument } from '../db_schemas/theory_schema';

@Injectable()
export class TheoryService {
  private readonly logger: Logger = new Logger(TheoryService.name);

  constructor(
    @InjectModel('Theory')
    private readonly theoryModel: Model<TheoryDocument>,
  ) {}

  async getTheory(stageId: string): Promise<unknown> {
    const dbTheory = await this.theoryModel.findOne({ stageId }).lean();
    if (!dbTheory) {
      throw new NotFoundException(
        `Không tìm thấy nội dung lý thuyết cho stage: ${stageId}`,
      );
    }
    return {
      stageId: dbTheory.stageId,
      title: dbTheory.title,
      contentHtml: dbTheory.contentHtml,
      proTips: dbTheory.proTips,
      videoUrl: (<{ videoUrl?: string }>dbTheory).videoUrl ?? '',
      referenceLinks: dbTheory.referenceLinks,
    };
  }
}
