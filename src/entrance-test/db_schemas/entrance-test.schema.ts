import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EntranceTestQuestionDocument = HydratedDocument<EntranceTestQuestion>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class EntranceTestQuestion {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  question!: string;

  @Prop({ required: true, type: String, enum: ['multiple-choice', 'true-false'] })
  type!: 'multiple-choice' | 'true-false';

  @Prop({ type: [String], required: true })
  options!: string[];

  @Prop({ required: true })
  correctAnswer!: string;

  @Prop({ default: '' })
  starterCode!: string;

  created_at!: Date;
  updated_at!: Date;
}

export const EntranceTestQuestionSchema = SchemaFactory.createForClass(EntranceTestQuestion);
