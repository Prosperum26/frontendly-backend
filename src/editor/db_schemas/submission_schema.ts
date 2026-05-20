import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: { createdAt: 'saved_At' } })
export class Submission {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ required: true, ref: 'User' }) // chiếu qua user => chỉ là userFake để chạy local
  userId: string;

  @Prop({ required: true, ref: 'Exercise' }) // chiếu qua exercise
  exerciseId: string;

  @Prop({ required: true })
  isCompleted: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  match_percentage: mongoose.Types.Decimal128;

  @Prop({ trim: true, length: 100000, default: '' })
  html_content: string;

  @Prop({ trim: true, length: 100000, default: '' })
  css_content: string;

  @Prop({ trim: true, length: 100000, default: '' })
  js_content: string;

  createdAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
