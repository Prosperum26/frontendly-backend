import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop({ type: [LintErrorDetailSchema], default: [] })
  jsx_err!: LintErrorDetail[];
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

  @Prop({ required: true, type: Number })
  matchPercentage!: number;

  @Prop({ type: String, default: null })
  diffImageUrl!: string | null;
}
const VisualTestResultSchema = SchemaFactory.createForClass(VisualTestResult);

@Schema({ _id: false }) // _id: false vì đây chỉ là object con nằm trong Submission, không cần sinh ObjectId riêng
export class BehaviorResult {
  @Prop({ required: true, type: Boolean })
  passed!: boolean;

  @Prop({ required: true, type: Number })
  totalTests!: number;

  @Prop({ required: true, type: Number })
  passedTests!: number;

  @Prop({ type: [String], default: '' })
  errors!: string;
}
const BehaviorResultSchema = SchemaFactory.createForClass(BehaviorResult);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Submission {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  exerciseId!: string;

  @Prop({ required: true })
  isCompleted!: boolean;

  @Prop({ required: true, type: Number })
  match_percentage!: number;

  @Prop({ type: [EvaluationResultSchema], default: [] })
  requirementResult!: EvaluationRequirementResult[];

  @Prop({
    type: LintErrorGroupSchema,
    default: { html_err: [], css_err: [], js_err: [], jsx_err: [] },
  })
  lint_errors!: LintErrorGroup;

  @Prop({ type: [VisualTestResultSchema], default: [] })
  visual_results!: VisualTestResult[];

  @Prop({ type: BehaviorResultSchema, default: null })
  behavior_results!: BehaviorResult | null;

  @Prop({ trim: true, maxlength: 100000, default: '' })
  html_content!: string;

  @Prop({ trim: true, maxlength: 100000, default: '' })
  css_content!: string;

  @Prop({ trim: true, maxlength: 100000, default: '' })
  js_content!: string;

  @Prop({ trim: true, maxlength: 100000, default: '' })
  jsx_content!: string;

  created_at!: Date;
  updated_at!: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
