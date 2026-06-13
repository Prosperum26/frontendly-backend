import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StageProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id!: Types.ObjectId;

  @Prop({ required: true })
  currentStage!: number;

  @Prop({ required: true })
  maxUnlockedStage!: number;

  @Prop({ default: [] })
  completedStages!: number[];

  @Prop({ default: 0 })
  totalProgress!: number;

  @Prop()
  lastAccessedAt?: Date;

  override _id: Types.ObjectId;
}

export const StageProgressSchema = SchemaFactory.createForClass(StageProgress);
