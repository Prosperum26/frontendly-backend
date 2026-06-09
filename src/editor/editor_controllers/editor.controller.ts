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

  @Get(':exerciseId/:userId')
  async getExercise(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') userId: string,
  ): Promise<Exercise> {
    try {
      const exercise = await this.editorService.getExercise(exerciseId, userId);
      return exercise;
    } catch (error) {
      this.logger.error(`Error fetching exercise ${exerciseId}:`, error);
      throw new NotFoundException('Not found excercise');
    }
  }

  @Post(':exerciseId/:userId/submit')
  async submitCode(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') userId: string,
    @Body() submitCode: SubmitCodeDto,
  ): Promise<SubmitResponse> {
    try {
      return await this.editorService.submitCode(
        userId,
        exerciseId,
        submitCode.editorContent,
      );
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || 'Error in evaluating code!',
      );
    }
  }
}
