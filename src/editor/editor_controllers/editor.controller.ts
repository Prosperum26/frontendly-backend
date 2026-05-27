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
import { SandBox } from '../runners/sandbox.runner';
import { SubmitCodeDto } from '../dtos/submit_code.dto';
import { LintEvaluation } from '../dtos/lint_evaluators.dto';
import { CheckLint } from '../editor_service/editor.service';
@Controller({
  path: 'exercises',
  version: '1',
})
export class EditorController {
  constructor(
    private readonly editorService: EditorService,
    private readonly sandBox: SandBox,
    private readonly codeLint: CheckLint,
  ) {}

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

  // Chỉ để test xem đã tạo sandBox được chưa?
  @Post(':exerciseId')
  async sandBoxRunner(
    @Param('exerciseId') exerciseId: string,
    @Body() submitCode: SubmitCodeDto,
  ): Promise<string> {
    try {
      const { html, css, javascript } = submitCode.editorContent;
      const renderCode = await this.sandBox.createSandBox(
        html,
        css,
        javascript,
      );
      if (!renderCode) throw new Error('No code in SandBox');
      return renderCode;
    } catch (error) {
      throw new Error('Error in create SandBox');
    }
  }

  @Post(':excerciseId/submit')
  async checkLintCode(
    @Param('exerciseId') exerciseId: string,
    @Body() submitCode: SubmitCodeDto,
  ): Promise<LintEvaluation> {
    try {
      const { html, css, javascript } = submitCode.editorContent;
      const evaluationResult = await this.codeLint.checkLintUserCode(
        html,
        css,
        javascript,
      );
      return evaluationResult;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || 'Lỗi hệ thống khi chấm code!',
      );
    }
  }
}
