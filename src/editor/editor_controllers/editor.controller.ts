/* eslint-disable no-console */
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { Exercise } from '../db_schemas/exercise_schema';
import { EditorService } from '../editor_service/editor.service';

@Controller({
  path: 'exercises',
  version: '1',
})
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Get(':exerciseId')
  async getExercise(
    @Param('exerciseId') exerciseId: string,
  ): Promise<Exercise> {
    try {
      const exercise = await this.editorService.getExerciseById(exerciseId);
      return exercise;
    } catch (error) {
      console.log('Error:', error);
      throw new NotFoundException('Not found excercise');
    }
  }
}
