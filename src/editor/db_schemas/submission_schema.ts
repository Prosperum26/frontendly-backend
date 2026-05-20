import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { Exercise } from './exercise_schema';
import { User } from './userFake_schema';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: { createdAt: 'saved_At' } })
export class Submission {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' }) // chiếu qua user => chỉ là userFake để chạy local
  userId: User;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
  }) // chiếu qua exercise
  exerciseId: Exercise;

  @Prop({ required: true })
  isCompleted: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  match_percentage: mongoose.Types.Decimal128;

  @Prop({ required: true, trim: true, length: 100000 })
  html_content: string;

  @Prop({ required: true, trim: true, length: 100000 })
  css_content: string;

  @Prop({ required: true, trim: true, length: 100000 })
  js_content: string;

  createdAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
