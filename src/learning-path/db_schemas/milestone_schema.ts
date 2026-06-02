import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StageDocument = HydratedDocument<Stage>;

@Schema({ _id: false })
export class Stage {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: '' })
  icon!: string;

  @Prop({ default: false })
  isCompleted!: boolean;

  @Prop({ default: 0 })
  earnedStars!: number;
}

export const StageSchema = SchemaFactory.createForClass(Stage);

export type MilestoneDocument = HydratedDocument<Milestone>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Milestone {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({
    type: String,
    enum: ['locked', 'in_progress', 'completed'],
    default: 'locked',
  })
  status!: 'locked' | 'in_progress' | 'completed';

  @Prop({ default: '' })
  icon!: string;

  @Prop({ type: [StageSchema], default: [] })
  stages!: Stage[];

  created_at!: Date;
  updated_at!: Date;
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);
