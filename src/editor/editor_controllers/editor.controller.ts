import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Body,
  Post,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

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
  ): Promise<{ success: boolean; data: Exercise }> {
    try {
      const exercise = await this.editorService.getExercise(exerciseId);
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
  ): Promise<{ success: boolean; data: Exercise }> {
    return this.getExercise(exerciseId);
  }

  // Keep old endpoint for backwards compatibility
  @Post(':exerciseId/:userId/submit')
  async submitCodeBackwardsCompatible(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') userId: string,
    @Body() submitCode: SubmitCodeDto,
  ): Promise<{ success: boolean; data: SubmitResponse }> {
    try {
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
}
