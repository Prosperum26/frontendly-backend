import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Body,
  Post,
  InternalServerErrorException,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Exercise } from '../db_schemas/exercise_schema';
import { SubmitCodeDto } from '../dtos/submit_code.dto';
import { SubmitResponse } from '../dtos/submitCodeResponse';
import { EditorService } from '../editor_service/editor.service';
import { ConfigureAuth } from '@/auth/decorators';

@ConfigureAuth({ blockIfUnauthenticated: false })
@Controller({
  path: 'exercises',
  version: '1',
})
export class EditorController {
  private readonly logger = new Logger(EditorController.name);

  constructor(private readonly editorService: EditorService) {}

  @Get(':exerciseId')
  async getExercise(
    @Param('exerciseId') exerciseId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; data: Exercise }> {
    try {
      const userId = this.extractUserId(req);
      const exercise = await this.editorService.getExercise(exerciseId, userId);
      return { success: true, data: exercise };
    } catch (error) {
      this.logger.error(`Error fetching exercise ${exerciseId}:`, error);
      throw new NotFoundException('Not found exercise');
    }
  }

  // Keep old endpoint for backwards compatibility
  @Get(':exerciseId/:userId')
  async getExerciseBackwardsCompatible(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') _userId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; data: Exercise }> {
    return this.getExercise(exerciseId, req);
  }

  @Post(':exerciseId/submit')
  async submitCode(
    @Param('exerciseId') exerciseId: string,
    @Body() submitCode: SubmitCodeDto,
    @Req() req: Request,
  ): Promise<{ success: boolean; data: SubmitResponse }> {
    try {
      const userId = this.extractUserId(req);
      const result = await this.editorService.submitCode(
        userId,
        exerciseId,
        submitCode.editorContent,
      );
      return { success: true, data: result };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || 'Error in evaluating code!',
      );
    }
  }

  // Keep old endpoint for backwards compatibility
  @Post(':exerciseId/:userId/submit')
  async submitCodeBackwardsCompatible(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') _userId: string,
    @Body() submitCode: SubmitCodeDto,
    @Req() req: Request,
  ): Promise<{ success: boolean; data: SubmitResponse }> {
    return this.submitCode(exerciseId, submitCode, req);
  }

  private extractUserId(req: Request): string {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const user = req.user as
      | { profile?: { _id?: { toString(): string } } }
      | undefined;
    return user?.profile?._id?.toString() || 'guest';
  }
}
