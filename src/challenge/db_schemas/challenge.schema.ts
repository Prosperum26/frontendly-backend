import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChallengeExerciseDocument = HydratedDocument<ChallengeExercise>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class ChallengeExercise {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, type: String, enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty!: 'beginner' | 'intermediate' | 'advanced';

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: '' })
  previewImage!: string;

  created_at!: Date;
  updated_at!: Date;
}

export const ChallengeExerciseSchema = SchemaFactory.createForClass(ChallengeExercise);
