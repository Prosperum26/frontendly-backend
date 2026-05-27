import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExerciseDocument = HydratedDocument<Exercise>;
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

  @Prop({ type: [{ id: String, text: String, _id: false }], default: [] })
  requirements!: { id: string; text: string }[];

  @Prop({
    type: { html: String, css: String, javascript: String, _id: false },
    required: true,
  })
  editor_content!: {
    html: string;
    css: string;
    javascript: string;
  };

  @Prop({ type: Object, default: null })
  navigation!: {
    prev: { type: string; id: string; slug?: string } | null;
    next: { type: string; id: string; slug?: string } | null;
  };

  created_at!: Date;
  updated_at!: Date;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
