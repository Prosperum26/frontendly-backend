import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CheckLint } from './checkLint.service';
import { VisualRegressionService } from './visual_regression.service';
import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';
import { SubmissionDocument } from '../db_schemas/submission_schema';
import { SubmitResponse } from '../dtos/submitCodeResponse';
import { VisualEvaluationDto } from '../dtos/visual_regression.dto';
import { RequirementEvaluator } from '../evaluators/requirements/requirements.evaluators';
import { LearningPathService } from '@/learning-path/learning_path_service/learning_path.service';

@Injectable()
export class EditorService {
  private readonly logger = new Logger(EditorService.name);

  constructor(
    @InjectModel('Exercise')
    private readonly exerciseModel: Model<ExerciseDocument>,
    @InjectModel('Submission')
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly codeLint: CheckLint,
    private readonly reqCheck: RequirementEvaluator,
    private readonly visualRegressionService: VisualRegressionService,
    private readonly learningPathService: LearningPathService,
  ) {}

  // Lấy bài tập
  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .select('-_id')
      .lean();
    if (!exercise) {
      throw new NotFoundException('Cannot find exercise');
    }
    return exercise;
  }

  // Lấy lần submit cuối
  async getLastSubmit(
    exerciseId: string,
    userId: string,
    exercise: Exercise,
  ): Promise<Exercise> {
    const lastExercise = await this.submissionModel
      .findOne({
        exerciseId: exerciseId,
        userId: userId,
      })
      .sort({ _id: -1 })
      .lean();
    if (!lastExercise) {
      return exercise;
    }
    return {
      ...exercise,
      html_content: lastExercise.html_content,
      css_content: lastExercise.css_content,
      js_content: lastExercise.js_content,
    };
  }

  // Lấy bài tập
  async getExercise(exerciseId: string, userId: string): Promise<Exercise> {
    const rawExercise = await this.getExerciseById(exerciseId);
    if (!rawExercise) {
      throw new NotFoundException('Cannot find exercise!');
    }
    const lastSubmitExercise = await this.getLastSubmit(
      exerciseId,
      userId,
      rawExercise,
    );
    if (!lastSubmitExercise) {
      return rawExercise;
    } else {
      return lastSubmitExercise;
    }
  }

  // Evaluate Code khi user submit
  async submitCode(
    userId: string,
    exerciseId: string,
    editorContent: any,
  ): Promise<SubmitResponse> {
    try {
      const { html, css, js } = editorContent;
      const exercise = await this.getExerciseById(exerciseId);

      const lintResult = await this.codeLint.checkLintUserCode(html, css, js);

      const hasLintError =
        (lintResult?.html_err?.length ?? 0) > 0 ||
        (lintResult?.css_err?.length ?? 0) > 0 ||
        (lintResult?.js_err?.length ?? 0) > 0;

      // Khởi tạo các biến chứa kết quả mặc định an toàn tuyệt đối
      let requirementResults: any[] = Array.isArray(exercise.requirements)
        ? exercise.requirements.map(req => ({
            requirementId: req.id,
            passed: false,
          }))
        : [];

      let visualResults: VisualEvaluationDto[] = [];
      let matchPercentage = 0.0;
      let isCompleted = false;

      if (hasLintError) {
        await this.saveSubmission(userId, exerciseId, editorContent, {
          isCompleted: false,
          match_percentage: 0,
          lint_errors: lintResult,
          requirementResult: requirementResults,
          visual_results: [],
        });
        return {
          isCompleted: false,
          match_percentage: 0,
          lint_errors: lintResult,
          requirementResult: requirementResults,
          visual_results: [],
        };
      }

      // Đã tháo 'await' ở đây, khớp hoàn toàn với file requirements.evaluators.ts
      requirementResults = this.reqCheck.evaluateCode(
        html,
        css,
        js,
        exercise.requirements,
      );

      const countReq = requirementResults.length;
      const countPass = requirementResults.filter(
        (req: any) => req.passed,
      ).length;
      const reqCheck = countReq > 0 ? (countPass / countReq) * 100 : 100;
      const isRequirementsPassed = reqCheck === 100;

      // An toàn và tường minh tuyệt đối cho phần bài Khó
      const isHardExercise =
        exercise.target_designs && exercise.target_designs.length > 0;

      if (isHardExercise) {
        if (isRequirementsPassed) {
          visualResults = await this.visualRegressionService.evaluateVisual(
            html,
            css,
            js,
            exercise.target_designs,
          );

          const isVisualPassed =
            visualResults.length > 0 &&
            visualResults.every(result => result.passed);
          isCompleted = isVisualPassed;

          if (isCompleted) {
            matchPercentage = 100.0;
          } else {
            const totalVisualScore = visualResults.reduce(
              (sum, current) => sum + current.matchPercentage,
              0,
            );
            matchPercentage =
              visualResults.length > 0
                ? totalVisualScore / visualResults.length
                : 0;
          }
        } else {
          isCompleted = false;
          matchPercentage = reqCheck;
        }
      } else {
        isCompleted = isRequirementsPassed;
        matchPercentage = parseFloat(reqCheck.toFixed(2));
      }

      const finalMatchPercentage = parseFloat(matchPercentage.toFixed(2));

      await this.saveSubmission(userId, exerciseId, editorContent, {
        isCompleted,
        match_percentage: finalMatchPercentage,
        lint_errors: lintResult,
        requirementResult: requirementResults,
        visual_results: visualResults,
      });

      // Update Learning Path progress if completed
      if (isCompleted && userId !== 'guest') {
        try {
          // exerciseId format: "exercise_s1"
          const stageId = exerciseId.startsWith('exercise_')
            ? exerciseId.replace('exercise_', '')
            : exerciseId;

          await this.learningPathService.completeStage(stageId, userId);
        } catch (err) {
          this.logger.error(
            `Failed to update progress for user ${userId} on exercise ${exerciseId}: ${err.message}`,
          );
        }
      }

      return {
        isCompleted,
        match_percentage: finalMatchPercentage,
        lint_errors: lintResult,
        requirementResult: requirementResults,
        visual_results: visualResults,
      };
    } catch (error: any) {
      this.logger.error(
        `[SubmitCode Error] Bài tập ${exerciseId}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Please try again later!');
    }
  }

  // Hàm private yên vị dưới đáy class, chuẩn ESLint member-ordering
  private async saveSubmission(
    userId: string,
    exerciseId: string,
    editorContent: { html: string; css: string; js: string },
    resultData: {
      isCompleted: boolean;
      match_percentage: number;
      lint_errors: any;
      requirementResult: any[];
      visual_results: any[];
    },
  ): Promise<SubmissionDocument> {
    const totalSubmissions = await this.submissionModel.countDocuments();

    const newSubmit = new this.submissionModel({
      id: `sub_${totalSubmissions + 1}`,
      userId,
      exerciseId,
      html_content: editorContent.html,
      css_content: editorContent.css,
      js_content: editorContent.js,
      isCompleted: resultData.isCompleted,
      match_percentage: resultData.match_percentage,
      lint_errors: resultData.lint_errors,
      requirementResult: resultData.requirementResult,
      visual_results: resultData.visual_results,
    });

    await newSubmit.save();
    return newSubmit;
  }
}
