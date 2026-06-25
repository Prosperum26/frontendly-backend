import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { ExerciseTag } from './exercise.enum';
import { JsxRestriction } from './exercise.enum';

export type ExerciseDocument = HydratedDocument<Exercise>;
@Schema({ _id: false })
export class ExerciseRequirement {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ default: '' })
  selector?: string;

  @Prop({
    enum: ['exist', 'count', 'content', 'attribute', 'hook', 'prop', ''],
    default: '',
  })
  type?: string;

  @Prop({ required: true, default: 'others', enum: ['behavior', 'others'] })
  type_check!: string;

  @Prop({ default: '' })
  expectedValue?: string;
}

const ExerciseRequirementSchema =
  SchemaFactory.createForClass(ExerciseRequirement);

@Schema({ _id: false })
export class TargetDesign {
  @Prop({ required: true })
  deviceType!: string;

  @Prop({ required: true })
  width!: number;

  @Prop({ required: true })
  height!: number;
}
const TargetDesignSchema = SchemaFactory.createForClass(TargetDesign);

@Schema({ _id: false })
export class EvaluationConfig {
  @Prop({ type: Boolean, default: true })
  lint!: boolean;

  @Prop({ type: Boolean, default: true })
  requirements!: boolean;

  @Prop({ type: Boolean, default: false })
  visual!: boolean;

  @Prop({ type: Boolean, default: false })
  behavior!: boolean;
}
const EvaluationConfigSchema = SchemaFactory.createForClass(EvaluationConfig);

@Schema({ _id: false })
export class CodeTest {
  @Prop({ trim: true, default: '' })
  html!: string;

  @Prop({ trim: true, default: '' })
  css!: string;

  @Prop({ trim: true, default: '' })
  js!: string;

  @Prop({ trim: true, default: '' })
  jsx!: string;
}
const CodeTestSchema = SchemaFactory.createForClass(CodeTest);

@Schema({ _id: false })
export class RestrictionDetail {
  @Prop({ type: String, enum: Object.values(JsxRestriction), required: true })
  rule!: JsxRestriction;

  @Prop({ type: String, required: true })
  message!: string;
}
const RestrictionSchema = SchemaFactory.createForClass(RestrictionDetail);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Exercise {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  module!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' })
  level!: 'easy' | 'medium' | 'hard';

  @Prop({ required: true })
  description!: string;

  @Prop({
    type: EvaluationConfigSchema,
    default: () => ({ lint: true, requirements: true, visual: false }),
  })
  evaluation_config!: EvaluationConfig;

  @Prop({ type: [RestrictionSchema], default: [] }) // dùng để thêm config cho ReactJS
  restrictions!: RestrictionDetail[];

  @Prop({ type: [String], default: [], enum: Object.values(ExerciseTag) })
  tags!: ExerciseTag[];

  @Prop({ trim: true, default: '', maxlength: 100000 }) // lưu phần code gần nhất
  html_content!: string;

  @Prop({ trim: true, default: '', maxlength: 100000 }) // lưu phần code gần nhất
  css_content!: string;

  @Prop({ trim: true, default: '', maxlength: 100000 }) // lưu phần code gần nhất
  js_content!: string;

  @Prop({ trim: true, default: '', maxlength: 100000 }) // lưu phần code gần nhất
  jsx_content!: string;

  @Prop({ type: TargetDesignSchema, default: null })
  target_design!: TargetDesign;

  @Prop({ trim: true, default: '' }) // test script để test behavior cho reactjs
  target_url!: string;

  @Prop({ type: CodeTestSchema, default: null }) // code test mẫu để chạy visual regress
  code_test!: CodeTest | null;

  @Prop({ trim: true, default: '' }) // test script để test behavior cho reactjs
  test_script!: string;

  @Prop({ type: [ExerciseRequirementSchema], default: [] })
  requirements!: ExerciseRequirement[];

  @Prop({ type: Object, default: null })
  navigation!: {
    prev: { type: string; id: string; slug?: string } | null;
    next: { type: string; id: string; slug?: string } | null;
  };

  created_at!: Date;
  updated_at!: Date;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
