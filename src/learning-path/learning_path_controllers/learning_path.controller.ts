import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';

import { SubmitCodeDto } from './learning_path.dto';
import { LearningPathService } from '../learning_path_service/learning_path.service';

// ────────────────────────────────────────────────────────────
// Helper: Lấy userId từ JWT (req.user) hoặc fallback dummy
// AuthGuard gắn user vào req.user = { token, profile }
// Khi AuthGuard chưa bật → req.user = undefined → dùng dummy
// ────────────────────────────────────────────────────────────
function extractUserId(req: Request): string {
  const user = req.user as
    | { profile?: { _id?: { toString(): string } } }
    | undefined;
  return user?.profile?._id?.toString() ?? 'dummy-user-001';
}

// ============================================================
// ROADMAP CONTROLLER
// ============================================================
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
    @Req() req: Request,
  ) {
    try {
      const userId = extractUserId(req);
      const data = await this.learningPathService.getRoadmap(
        skillId,
        Number(page),
        Number(limit),
        userId,
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

// ============================================================
// STAGES CONTROLLER
// ============================================================
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
  async unlockPractice(@Param('stageId') stageId: string, @Req() req: Request) {
    const userId = extractUserId(req);
    const data = await this.learningPathService.unlockPractice(stageId, userId);
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

// ============================================================
// EXERCISES CONTROLLER
// ============================================================
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
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const data = await this.learningPathService.submitCode(
      exerciseId,
      body.submittedCode,
      userId,
    );
    return {
      success: true,
      message: 'Chấm điểm thành công',
      data,
    };
  }
}

// ============================================================
// LEARNING CONTENT CONTROLLER
// Quản lý và truy vấn nội dung học tập
// ============================================================
@Controller({
  path: 'learning-content',
  version: '1',
})
export class LearningContentController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // API 6: GET /api/v1/learning-content/skills
  // Lấy danh sách tất cả skills có lộ trình
  @Get('skills')
  async getAvailableSkills() {
    const data = await this.learningPathService.getAvailableSkills();
    return {
      success: true,
      message: 'Lấy danh sách skills thành công',
      data,
    };
  }

  // API 7: GET /api/v1/learning-content/stages/:stageId/full
  // Lấy toàn bộ nội dung của 1 stage (theory + practices) — dùng cho preload
  @Get('stages/:stageId/full')
  async getFullStageContent(@Param('stageId') stageId: string) {
    try {
      const data = await this.learningPathService.getFullStageContent(stageId);
      return {
        success: true,
        message: 'Lấy nội dung stage thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException(`Stage content not found: ${stageId}`);
    }
  }

  // API 8: GET /api/v1/learning-content/progress/summary
  // Lấy tóm tắt tiến độ học tập tổng thể của user
  @Get('progress/summary')
  async getProgressSummary(@Req() req: Request) {
    const userId = extractUserId(req);
    const data = await this.learningPathService.getProgressSummary(userId);
    return {
      success: true,
      message: 'Lấy tiến độ học tập thành công',
      data,
    };
  }
}
