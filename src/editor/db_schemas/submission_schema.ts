import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ _id: false })
export class LintErrorDetail {
  @Prop({ required: true })
  line!: number;

  @Prop({ required: true })
  message!: string;
}
const LintErrorDetailSchema = SchemaFactory.createForClass(LintErrorDetail);

@Schema({ _id: false })
export class LintErrorGroup {
  @Prop({ type: [LintErrorDetailSchema], default: [] })
  html_err!: LintErrorDetail[];

  @Prop({ type: [LintErrorDetailSchema], default: [] })
  css_err!: LintErrorDetail[];

  @Prop({ type: [LintErrorDetailSchema], default: [] })
  js_err!: LintErrorDetail[];
}
const LintErrorGroupSchema = SchemaFactory.createForClass(LintErrorGroup);

@Schema({ _id: false })
export class EvaluationRequirementResult {
  @Prop({ required: true })
  requirementId!: string;

  @Prop({ required: true })
  passed!: boolean;
}
const EvaluationResultSchema = SchemaFactory.createForClass(
  EvaluationRequirementResult,
);

@Schema({ _id: false })
export class VisualTestResult {
  @Prop({ required: true })
  deviceType!: string;

  @Prop({ required: true })
  passed!: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  matchPercentage!: mongoose.Types.Decimal128;

  @Prop({ type: String, default: null })
  diffImageUrl!: string | null;
}
const VisualTestResultSchema = SchemaFactory.createForClass(VisualTestResult);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Submission {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true, ref: 'User' })
  userId!: string;

  @Prop({ required: true, ref: 'Exercise' })
  exerciseId!: string;

  @Prop({ required: true })
  isCompleted!: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  match_percentage!: mongoose.Types.Decimal128;

  @Prop({ type: [EvaluationResultSchema], default: [] })
  requirementResult!: EvaluationRequirementResult[];

  @Prop({
    type: LintErrorGroupSchema,
    default: { html_err: [], css_err: [], js_err: [] },
  })
  lint_errors!: LintErrorGroup;

  @Prop({ type: [VisualTestResultSchema], default: [] })
  visual_results!: VisualTestResult[];

  @Prop({ trim: true, maxlength: 100000, default: '' })
  html_content!: string;

  @Prop({ trim: true, maxlength: 100000, default: '' })
  css_content!: string;

  @Prop({ trim: true, maxlength: 100000, default: '' })
  js_content!: string;

  created_at!: Date;
  updated_at!: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
