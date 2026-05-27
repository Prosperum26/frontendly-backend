import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { SubmitCodeDto } from './learning_path.dto';
import { LearningPathService } from '../learning_path_service/learning_path.service';

@Controller({
  path: 'roadmaps',
  version: '1',
})
export class RoadmapController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // API 1: GET /api/v1/roadmaps/:skillId?page=1&limit=5
  @Get(':skillId')
  async getRoadmap(
    @Param('skillId') skillId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    try {
      const data = await this.learningPathService.getRoadmap(
        skillId,
        Number(page),
        Number(limit),
      );
      return {
        success: true,
        message: 'Lấy dữ liệu lộ trình thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Roadmap not found');
    }
  }
}

@Controller({
  path: 'stages',
  version: '1',
})
export class StagesController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // API 2: GET /api/v1/stages/:stageId/theory
  @Get(':stageId/theory')
  async getTheory(@Param('stageId') stageId: string) {
    try {
      const data = await this.learningPathService.getTheory(stageId);
      return {
        success: true,
        message: 'Lấy dữ liệu lý thuyết thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Theory not found');
    }
  }

  // API 3: PATCH /api/v1/stages/:stageId/unlock-practice
  @Patch(':stageId/unlock-practice')
  async unlockPractice(@Param('stageId') stageId: string) {
    const data = await this.learningPathService.unlockPractice(stageId);
    return {
      success: true,
      message: 'Đã mở khóa không gian bài tập',
      data,
    };
  }

  // API 4: GET /api/v1/stages/:stageId/practices
  @Get(':stageId/practices')
  async getPractices(@Param('stageId') stageId: string) {
    try {
      const data = await this.learningPathService.getPractices(stageId);
      return {
        success: true,
        message: 'Lấy danh sách bài tập thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Practices not found');
    }
  }
}

@Controller({
  path: 'exercises',
  version: '1',
})
export class ExercisesController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // API 5: POST /api/v1/exercises/:exerciseId/submit
  @Post(':exerciseId/submit')
  async submitCode(
    @Param('exerciseId') exerciseId: string,
    @Body() body: SubmitCodeDto,
  ) {
    const data = await this.learningPathService.submitCode(
      exerciseId,
      body.submittedCode,
    );
    return {
      success: true,
      message: 'Chấm điểm thành công',
      data,
    };
  }
}
