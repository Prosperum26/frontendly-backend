import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Exercise, ExerciseDocument } from '../db_schemas/exercise_schema';
import { Submission, SubmissionDocument } from '../db_schemas/submission_schema';

import { RequirementEvaluator } from '../evaluators/requirements.evaluators';
import { SubmitResponse } from '../dtos/submitCodeResponse';
import { CheckLint } from './checkLint.service';

@Injectable()
export class EditorService {
  constructor(
    @InjectModel('Exercise') private readonly exerciseModel: Model<ExerciseDocument>,
    @InjectModel('Submission') private readonly submissionModel: Model<SubmissionDocument>,
    private readonly codeLint: CheckLint,
    private readonly reqCheck: RequirementEvaluator,
  ) {}

  // Take exercise
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

  async getLastSubmit(exerciseId: string, userId:string, exercise:Exercise): Promise<Exercise> {
    const lastExercise = await this.submissionModel
      .findOne({
        exerciseId: exerciseId,
        userId: userId
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
      js_content: lastExercise.js_content
    }
  }

  async getExercise(exerciseId: string, userId: string): Promise<Exercise> {
    const rawExercise = await this.getExerciseById(exerciseId);
    if (!rawExercise) {
      throw new NotFoundException('Cannot find exercise!');
    }
    const lastSubmitExercise = await this.getLastSubmit(exerciseId, userId, rawExercise);
    if (!lastSubmitExercise) {
      return rawExercise;
    }
    else {
      return lastSubmitExercise;
    }
  }

  // Evaluate Code
  async submitExerciseEasyOrMed(userId: string, exerciseId: string, editorContent: any) : Promise<SubmitResponse> {
    const { html, css, js } = editorContent;
    const exercise = await this.getExerciseById(exerciseId);
    const lintResult = await this.codeLint.checkLintUserCode(html, css, js);
    const lintError = (lintResult.html_err?.length ?? 0) > 0 || (lintResult.css_err?.length ?? 0) > 0 || (lintResult.js_err?.length ?? 0) > 0;
    
    let results = [];
    let match_percentage = 0.0;
    if (!lintError) {
      results = this.reqCheck.evaluateCode(html, css, js, exercise.requirements);
      let countReq = results.length;
      let countPass = 0;
      results.forEach((req) => {
        if (req.passed) countPass += 1;
      })
      match_percentage = parseFloat(((countPass / countReq) * 100.0).toFixed(2));
    }
    else {
      results = exercise.requirements.map((req) => {
        return {
          requirementId: req.id,
          passed : false
        }
      })
    }
    
    const totalSubmissions = await this.submissionModel.countDocuments();
    const newSubmit = new this.submissionModel({
      id: `sub_${totalSubmissions + 1}`,
      userId: userId,
      exerciseId: exerciseId,
      isCompleted: match_percentage === 100.0,
      match_percentage: match_percentage,
      evaluationResults: results,
      html_content: html,
      css_content: css,
      js_content: js,
    })
    await newSubmit.save();

    return {
      isCompleted: match_percentage === 100.0,
      match_percentage: match_percentage,
      lint_errors: lintResult,
      evaluationResults: results,
    }
  }
}



