import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';

import { CheckLint } from './checkLint.service';
import { VisualRegressionService } from './visual_regression.service';
import { ExerciseTag } from '../db_schemas/exercise.enum';
import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';
import { SubmissionDocument } from '../db_schemas/submission_schema';
import { SubmitResponse } from '../dtos/submitCodeResponse';
import { VisualEvaluationDto } from '../dtos/visual_regression.dto';
import { BehaviorEvaluator } from '../evaluators/behavior/behavior.evaluator';
import { RequirementEvaluator } from '../evaluators/requirements/requirements.evaluators';
import { LearningPathService } from '@/learning-path/learning_path_service/learning_path.service';
import { UserUtilsService } from '@/learning-path/learning_path_service/user-utils.service';
import { ActivityType } from '@/users/schemas/activity-log.schema';
import { GamificationService } from '@/users/services/gamification.service';

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
    private readonly gamificationService: GamificationService,
    private readonly behaviorEvaluator: BehaviorEvaluator,
    private readonly userUtilsService: UserUtilsService,
  ) {}

  // Lấy bài tập
  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const exercise = await this.exerciseModel
      .findOne({ id: exerciseId })
      .select('-_id')
      .lean();
    if (!exercise) {
      const stageId = exerciseId.startsWith('exercise_')
        ? exerciseId.replace('exercise_', '')
        : 's1';

      const defaultExercise: Exercise = {
        id: exerciseId,
        module: `frontend:${stageId}`,
        title: `Practice for ${stageId}`,
        level: 'easy',
        description:
          'Complete this practice exercise to reinforce your learning.',
        evaluation_config: {
          lint: true,
          requirements: true,
          visual: false,
          behavior: false,
        },
        html_content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Practice</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Start coding here!</p>
</body>
</html>`,
        css_content: `body {
    font-family: Arial, sans-serif;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
}`,
        js_content: `// Start writing your JavaScript here!
console.log('Hello from practice!');`,
        jsx_content: `import React, { useState } from 'react';
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="practice-app">
      <h1>Hello from React!</h1>
      <p>Start building your component here.</p>
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}`,
        target_design: {
          deviceType: 'desktop',
          width: 1920,
          height: 780,
        },
        code_test: null,
        test_script: '',
        target_url: '',
        restrictions: [],
        tags: [ExerciseTag.EASY],
        requirements: [
          {
            id: 'req-1',
            text: 'Page must have an h1 element',
            selector: 'h1',
            type: 'exist',
            type_check: 'others',
            expectedValue: '',
          },
        ],
        navigation: { prev: null, next: null },
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Optionally save to database
      try {
        await this.exerciseModel.create(defaultExercise);
      } catch (err) {
        this.logger.error('Failed to save default exercise:', err);
      }
      return defaultExercise;
    }
    /* eslint-disable @typescript-eslint/naming-convention */
    const result: Exercise = {
      ...exercise,
      code_test: null,
      test_script: '',
      requirements: exercise.requirements.map(({ id, text }) => ({
        id,
        text,
      })),
      restrictions: [],
    };
    return result;
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
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      ...exercise,
      code_test: null,
      test_script: '',
      restrictions: [],
      requirements: exercise.requirements.map(({ id, text }) => ({
        id,
        text,
      })),
      html_content: lastExercise.html_content,
      css_content: lastExercise.css_content,
      js_content: lastExercise.js_content,
      jsx_content: lastExercise.jsx_content,
    };
  }

  // Lấy bài tập
  async getExercise(exerciseId: string, userId: string): Promise<Exercise> {
    const rawExercise = await this.getExerciseById(exerciseId);
    if (!rawExercise) {
      throw new NotFoundException('Cannot find exercise!');
    }

    // Tính toán navigation
    const navigation = this.calculateExerciseNavigation(exerciseId);

    const lastSubmitExercise = await this.getLastSubmit(
      exerciseId,
      userId,
      rawExercise,
    );
    if (!lastSubmitExercise) {
      return { ...rawExercise, navigation };
    } else {
      return { ...lastSubmitExercise, navigation };
    }
  }

  // Evaluate Code khi user submit
  async submitCode(
    userId: string,
    exerciseId: string,
    editorContent: any,
  ): Promise<SubmitResponse> {
    try {
      this.logger.debug(
        `[SubmitCode] Start: userId=${userId}, exerciseId=${exerciseId}`,
      );

      if (!editorContent) {
        throw new Error('Missing editorContent in request body');
      }

      const { html = '', css = '', js = '', jsx = '' } = editorContent;
      const exercise = await this.getExerciseById(exerciseId);
      this.logger.debug(`[SubmitCode] Exercise found: ${exercise.id}`);

      const evalConfig = exercise.evaluation_config || {
        lint: true,
        requirements: true,
        visual: false,
        behavior: false,
      };

      // lint
      let lintResult: any = {
        html_err: [],
        css_err: [],
        js_err: [],
        jsx_err: [],
      };
      let hasLintError = false;
      if (evalConfig.lint) {
        lintResult = await this.codeLint.checkLintUserCode(
          html,
          css,
          js,
          jsx,
          exercise.restrictions,
        );
        this.logger.debug(`[SubmitCode] Lint check completed`);
        hasLintError =
          (lintResult?.html_err?.length ?? 0) > 0 ||
          (lintResult?.css_err?.length ?? 0) > 0 ||
          (lintResult?.js_err?.length ?? 0) > 0 ||
          (lintResult?.jsx_err?.length ?? 0) > 0;
      }

      const reqList = exercise.requirements || [];
      const requirementResults: any[] = reqList.map(req => ({
        requirementId: req.id,
        passed: false,
      }));

      // requirement
      if (evalConfig.requirements && !hasLintError) {
        this.logger.debug(`[SubmitCode] Evaluating static requirements...`);
        const validReqs = reqList.filter(
          (req: any) => req.type_check !== 'behavior',
        );

        if (validReqs.length > 0) {
          const mergedReqResults: Record<string, boolean> = {};
          validReqs.forEach((req: any) => {
            mergedReqResults[req.id] = false;
          });

          if (
            (html && html.trim() !== '') ||
            (css && css.trim() !== '') ||
            (js && js.trim() !== '')
          ) {
            const checkHtmlCssJs = this.reqCheck.evaluateCodeHtmlCssJs(
              html,
              css,
              js,
              validReqs,
            );
            checkHtmlCssJs.forEach((result: any) => {
              if (result.passed) mergedReqResults[result.requirementId] = true;
            });
          }
          if (jsx && jsx.trim() !== '') {
            const checkReact = this.reqCheck.evaluateCodeReact(jsx, validReqs);
            checkReact.forEach((result: any) => {
              if (result.passed) mergedReqResults[result.requirementId] = true;
            });
          }

          requirementResults.forEach(req => {
            if (validReqs.find((v: any) => v.id === req.requirementId)) {
              req.passed = mergedReqResults[req.requirementId] || false;
            }
          });
        }
      }

      // visual regress
      let visualResults: VisualEvaluationDto[] = [];
      let isVisualPassed = true;
      let visualScore = 0;
      if (evalConfig.visual && !hasLintError) {
        this.logger.debug(
          `[SubmitCode] Visual check enabled, evaluating visual...`,
        );

        visualResults = await this.visualRegressionService.evaluateVisual(
          userId,
          exerciseId,
          html,
          css,
          js,
          jsx,
        );
        isVisualPassed =
          visualResults.length === 0 ||
          visualResults.every(result => result.passed);

        if (visualResults.length > 0) {
          const totalVisualScore = visualResults.reduce(
            (sum, current) => sum + current.matchPercentage,
            0,
          );
          visualScore = totalVisualScore / visualResults.length;
        }
      } else {
        isVisualPassed = false;
        visualScore = 0;
      }

      // behavior
      let behaviorResult = {
        passed: false,
        totalTests: 0,
        passedTests: 0,
        errors: '',
      };
      let isBehaviorPassed = true;

      if (evalConfig.behavior && !hasLintError) {
        this.logger.debug(`[SubmitCode] Evaluating ReactJS behavior...`);

        // eslint-disable-next-line sonarjs/no-gratuitous-expressions
        if (exercise.test_script?.trim()) {
          behaviorResult = await this.behaviorEvaluator.evaluateBehavior(
            jsx,
            exercise.test_script,
          );

          if (behaviorResult) {
            requirementResults.forEach((req: any) => {
              const behaviorCheck = reqList.find(
                (check: any) => check.id === req.requirementId,
              );
              if (behaviorCheck?.type_check === 'behavior') {
                req.passed = behaviorResult.passed;
              }
            });
          }
          isBehaviorPassed = behaviorResult.passed;
        } else {
          behaviorResult = {
            passed: false,
            totalTests: 0,
            passedTests: 0,
            errors: '[System Error] Test script is missing!',
          };
          isBehaviorPassed = false;
        }
      }

      // tính result
      let matchPercentage = 0;
      let isCompleted = false;
      let totalScore = 0;
      let checksCount = 0;

      let isRequirementsPassed = true;
      if (evalConfig.requirements) {
        const countReq = requirementResults.length;
        const countPass = requirementResults.filter(
          (req: any) => req.passed,
        ).length;
        isRequirementsPassed = countReq === 0 || countPass === countReq;

        totalScore += countReq > 0 ? (countPass / countReq) * 100 : 100;
        checksCount++;
      } else if (hasLintError) {
        isRequirementsPassed = false;
      }

      if (evalConfig.lint) {
        totalScore += hasLintError ? 0 : 100;
        checksCount++;
      }

      if (evalConfig.visual) {
        totalScore += visualScore;
        checksCount++;
      }

      if (evalConfig.behavior) {
        let behaviorPercent = 0;
        if (behaviorResult.totalTests > 0) {
          behaviorPercent =
            (behaviorResult.passedTests / behaviorResult.totalTests) * 100;
        }
        totalScore += behaviorPercent;
        checksCount++;
      }

      if (checksCount === 0) {
        isCompleted = true;
        matchPercentage = 100;
      } else {
        matchPercentage = totalScore / checksCount;
        isCompleted =
          (!evalConfig.lint || !hasLintError) &&
          (!evalConfig.requirements || isRequirementsPassed) &&
          (!evalConfig.visual || isVisualPassed) &&
          (!evalConfig.behavior || isBehaviorPassed);
      }

      const finalMatchPercentage = parseFloat(matchPercentage.toFixed(2));

      console.log('[Jest Error Detail]:', behaviorResult.errors);
      this.logger.debug(
        `[SubmitCode] Saving submission: passed=${isCompleted}, percentage=${finalMatchPercentage}`,
      );

      // Check if user already completed this exercise to prevent XP farming
      const previousSubmissions = await this.submissionModel
        .find({ userId, exerciseId, isCompleted: true })
        .lean();
      const alreadyCompleted = previousSubmissions.length > 0;

      await this.saveSubmission(userId, exerciseId, editorContent, {
        isCompleted,
        match_percentage: finalMatchPercentage,
        lint_errors: lintResult,
        requirementResult: requirementResults,
        visual_results: visualResults,
        behavior_results: behaviorResult,
      });

      if (
        isCompleted &&
        !this.userUtilsService.isGuestUser(userId) &&
        !alreadyCompleted
      ) {
        this.logger.debug(`[SubmitCode] Updating progress for user ${userId}`);
        try {
          const stageId = exerciseId.startsWith('exercise_')
            ? exerciseId.replace('exercise_', '')
            : exerciseId;

          await this.learningPathService.completeStage(stageId, userId);
          await this.gamificationService.addXp(
            userId,
            ActivityType.STAGE_COMPLETED,
            exerciseId,
          );
          await this.gamificationService.updateStreak(userId);
        } catch (err: any) {
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
        behavior_results: behaviorResult,
      };
    } catch (error: any) {
      this.logger.error(
        `[SubmitCode Error] Exercise ${exerciseId}: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Please try again later!');
    }
  }

  private calculateExerciseNavigation(exerciseId: string) {
    // Extract stage number from exerciseId: "exercise_s1" → 1, "exercise_s12" →12
    let stageNum = 1;
    if (exerciseId.startsWith('exercise_s')) {
      const numStr = exerciseId.replace('exercise_s', '');
      stageNum = parseInt(numStr, 10);
      if (isNaN(stageNum)) stageNum = 1;
    }

    // define milestone bằng id
    const getMilestoneId = (sNum: number) => {
      if (sNum <= 4) return 'm1'; // milestone 1
      if (sNum <= 8) return 'm2'; // milestone 2
      return 'm3'; // milestone 3
    };

    const currentMilestoneId = getMilestoneId(stageNum);

    // define bài tiếp theo
    let nextLessonNav = null;
    if (stageNum < 12) {
      const nextStageNum = stageNum + 1;
      const nextMilestoneId = getMilestoneId(nextStageNum);
      nextLessonNav = {
        type: 'theory',
        id: `s${nextStageNum}`,
        milestoneId: nextMilestoneId,
      };
    }

    return {
      prev: null,
      next: nextLessonNav,
      currentMilestoneId,
    };
  }

  private async saveSubmission(
    userId: string,
    exerciseId: string,
    editorContent: { html: string; css: string; js: string; jsx: string },
    resultData: {
      isCompleted: boolean;
      match_percentage: number;
      lint_errors: any;
      requirementResult: any[];
      visual_results: any[];
      behavior_results: any;
    },
  ): Promise<SubmissionDocument> {
    const timestamp = Date.now();
    const randomStr = randomBytes(3).toString('hex'); // random số làm key

    const newSubmit = new this.submissionModel({
      id: `sub_${timestamp}_${randomStr}`,
      userId,
      exerciseId,
      html_content: editorContent.html || '',
      css_content: editorContent.css || '',
      js_content: editorContent.js || '',
      jsx_content: editorContent.jsx || '',
      isCompleted: resultData.isCompleted,
      match_percentage: resultData.match_percentage,
      lint_errors: resultData.lint_errors || {
        html_err: [],
        css_err: [],
        js_err: [],
        jsx_err: [],
      },
      requirementResult: resultData.requirementResult || [],
      visual_results: (resultData.visual_results || []).map(vr => ({
        deviceType: vr.deviceType || 'unknown',
        passed: !!vr.passed,
        matchPercentage: vr.matchPercentage ?? 0,
        diffImageUrl: vr.diffImageUrl || null,
      })),
      behavior_results: resultData.behavior_results || null,
    });
    try {
      await newSubmit.save();
      const oldest = await this.submissionModel
        .find({ userId, exerciseId })
        .sort({ created_at: -1 })
        .skip(5)
        .select('_id')
        .lean();
      if (oldest.length > 0) {
        const idDelete = oldest.map(sub => sub._id);
        await this.submissionModel.deleteMany({ _id: { $in: idDelete } });
      }
    } catch (dbError: any) {
      this.logger.error(`Database Error saving submission: ${dbError.message}`);
      throw dbError;
    }
    return newSubmit;
  }
}
