import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExerciseDocument = HydratedDocument<Exercise>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Exercise {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  module: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  target_design_url: string;

  @Prop({ type: [{ id: Number, content: String }], default: [] })
  requirements: { id: number; content: string }[];

  created_at: Date;
  updated_at: Date;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
