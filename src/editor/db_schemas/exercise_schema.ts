import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExerciseDocument = HydratedDocument<Exercise>;
@Schema({ _id: false })
export class ExerciseRequirement {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  text!: string; 

  @Prop({ required: true })
  selector!: string; 

  @Prop({ required: true, enum: ['exist', 'count', 'content', 'attribute'] })
  type!: string;

  @Prop({ required: false })
  expectedValue?: string; 
}

const ExerciseRequirementSchema = SchemaFactory.createForClass(ExerciseRequirement);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Exercise {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  module!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  target_design_url!: string;

  @Prop({ trim: true, default: '', maxlength: 100000 })
  html_content!: string;

  @Prop({ trim: true, default: '', maxlength: 100000 })
  css_content!: string;

  @Prop({ trim: true, default: '', maxlength: 100000 })
  js_content!: string;

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