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

import {
  GetRoadmapQueryDto,
  PlacementTestDto,
  SubmitCodeDto,
  VideoProgressDto,
} from './learning_path.dto';
import { LearningPathService } from '../learning_path_service/learning_path.service';

function extractUserId(req: Request): string {
  const user = <{ profile?: { _id?: { toString(): string } } } | undefined>(
    req.user
  );
  return user?.profile?._id?.toString() ?? 'dummy-user-001';
}

@Controller({ path: 'roadmaps', version: '1' })
export class RoadmapController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // GET /api/v1/roadmaps/:skillId?page=1&limit=5
  @Get(':skillId')
  async getRoadmap(
    @Param('skillId') skillId: string,
    @Query() query: GetRoadmapQueryDto,
    @Req() req: Request,
  ): Promise<unknown> {
    try {
      const userId = extractUserId(req);
      const data = await this.learningPathService.getRoadmap(
        skillId,
        query.page,
        query.limit,
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

@Controller({ path: 'stages', version: '1' })
export class StagesController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // GET /api/v1/stages/:stageId/theory
  @Get(':stageId/theory')
  async getTheory(
    @Param('stageId') stageId: string,
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> {
    try {
      const userId = extractUserId(req);
      const data = await this.learningPathService.getTheory(stageId, userId);
      return {
        success: true,
        message: 'Lấy dữ liệu lý thuyết thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw error; // re-throw ForbiddenException as-is
    }
  }

  // PATCH /api/v1/stages/:stageId/complete
  @Patch(':stageId/complete')
  async completeStage(
    @Param('stageId') stageId: string,
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> {
    const userId = extractUserId(req);
    const data = await this.learningPathService.completeStage(stageId, userId);
    return { success: true, message: 'Hoàn thành stage thành công', data };
  }

  // PATCH /api/v1/stages/:stageId/unlock-practice
  @Patch(':stageId/unlock-practice')
  async unlockPractice(
    @Param('stageId') stageId: string,
    @Req() req: Request,
  ): Promise<unknown> {
    const userId = extractUserId(req);
    const data = await this.learningPathService.unlockPractice(stageId, userId);
    return { success: true, message: 'Đã mở khóa không gian bài tập', data };
  }

  // GET /api/v1/stages/:stageId/practices
  @Get(':stageId/practices')
  async getPractices(
    @Param('stageId') stageId: string,
    @Req() req: Request,
  ): Promise<unknown> {
    try {
      const userId = extractUserId(req);
      const data = await this.learningPathService.getPractices(stageId, userId);
      return {
        success: true,
        message: 'Lấy danh sách bài tập thành công',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw error; // re-throw ForbiddenException as-is
    }
  }

  // PATCH /api/v1/stages/:stageId/video-progress
  @Patch(':stageId/video-progress')
  async updateVideoProgress(
    @Param('stageId') stageId: string,
    @Body() body: VideoProgressDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const userId = extractUserId(req);
    const data = await this.learningPathService.updateVideoProgress(
      stageId,
      body.watchPercentage,
      body.seekPercentage ?? 0,
      userId,
    );
    return {
      success: true,
      message: 'Cập nhật tiến độ video thành công',
      data,
    };
  }

  // GET /api/v1/milestones/:milestoneId/status
  @Get('milestone/:milestoneId/status')
  async getMilestoneStatus(
    @Param('milestoneId') milestoneId: string,
    @Req() req: Request,
  ): Promise<unknown> {
    const userId = extractUserId(req);
    const data = await this.learningPathService.getMilestoneStatus(
      milestoneId,
      userId,
    );
    return {
      success: true,
      message: 'Lấy trạng thái milestone thành công',
      data,
    };
  }
}

@Controller({ path: 'exercises', version: '1' })
export class ExercisesController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // POST /api/v1/exercises/:exerciseId/submit
  @Post(':exerciseId/submit')
  async submitCode(
    @Param('exerciseId') exerciseId: string,
    @Body() body: SubmitCodeDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const userId = extractUserId(req);
    const data = await this.learningPathService.submitCode(
      exerciseId,
      body.submittedCode,
      userId,
    );
    return { success: true, message: 'Chấm điểm thành công', data };
  }
}

@Controller({ path: 'learning-content', version: '1' })
export class LearningContentController {
  constructor(private readonly learningPathService: LearningPathService) {}

  // GET /api/v1/learning-content/skills
  @Get('skills')
  async getAvailableSkills(): Promise<unknown> {
    const data = await this.learningPathService.getAvailableSkills();
    return { success: true, message: 'Lấy danh sách skills thành công', data };
  }

  // GET /api/v1/learning-content/stages/:stageId/full
  @Get('stages/:stageId/full')
  async getFullStageContent(
    @Param('stageId') stageId: string,
    @Req() req: Request,
  ): Promise<unknown> {
    try {
      const userId = extractUserId(req);
      const data = await this.learningPathService.getFullStageContent(
        stageId,
        userId,
      );
      return { success: true, message: 'Lấy nội dung stage thành công', data };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw error;
    }
  }

  // GET /api/v1/learning-content/progress/summary?skillId=frontend
  @Get('progress/summary')
  async getProgressSummary(
    @Req() req: Request,
    @Query('skillId') skillId?: string,
  ): Promise<unknown> {
    const userId = extractUserId(req);
    const data = await this.learningPathService.getProgressSummary(
      userId,
      skillId,
    );
    return { success: true, message: 'Lấy tiến độ học tập thành công', data };
  }

  // Phase 2: POST /api/v1/learning-content/sync-placement-test
  @Post('sync-placement-test')
  async syncPlacementTest(
    @Body() body: PlacementTestDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const userId = extractUserId(req);
    // FIX Bug 4: pass skillId from body so multi-skill placements work correctly
    const data = await this.learningPathService.syncPlacementTest(
      body.skipToMilestoneId,
      userId,
      body.skillId ?? 'frontend',
    );
    return {
      success: true,
      message: 'Đồng bộ kết quả placement test thành công',
      data,
    };
  }
}
