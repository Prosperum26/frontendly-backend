import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Body,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';

import { Exercise } from '../db_schemas/exercise_schema';

import { EditorService } from '../editor_service/editor.service';
import { SubmitCodeDto } from '../dtos/submit_code.dto';
import { CheckLint } from '../editor_service/checkLint.service';

import { SubmitResponse } from '../dtos/submitCodeResponse';
@Controller({
  path: 'exercises',
  version: '1',
})
export class EditorController {
  constructor(
    private readonly editorService: EditorService,
  ) {}

  @Get(':exerciseId/:userId')
  async getExercise(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') userId: string
  ): Promise<Exercise> {
    try {
      const exercise = await this.editorService.getExercise(exerciseId, userId);
      return exercise;
    } catch (error) {
      console.log('Error:', error);
      throw new NotFoundException('Not found excercise');
    }
  }

  @Post(':exerciseId/:userId/submit')
  async SubmitCode(
    @Param('exerciseId') exerciseId: string,
    @Param('userId') userId:string,
    @Body() submitCode: SubmitCodeDto,
  ): Promise<SubmitResponse> {
    try {
      return await this.editorService.submitExerciseEasyOrMed(userId, exerciseId, submitCode.editorContent);
      // if (exerciseId.endsWith('1') || exerciseId.endsWith('2')) {
      //   return await this.editorService.submitExerciseEasyOrMed(userId, exerciseId, submitCode.editorContent);
      // }
      // else if (exerciseId.endsWith('3')) {
        
      // }
    }
    catch (error:any) {
      throw new InternalServerErrorException(
        error.message || 'Error in evaluating code!',
      );
    }
  }
}
