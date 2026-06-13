import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BadgeCategory {
  BEGINNER = 'beginner',
  STREAK = 'streak',
  XP = 'xp',
  LEARNING = 'learning',
  SPECIAL = 'special',
}

export enum BadgeUnlockType {
  XP_AMOUNT = 'xp_amount',
  STREAK_DAYS = 'streak_days',
  STAGES_COMPLETED = 'stages_completed',
  SPECIAL_ACTION = 'special_action',
}

export interface BadgeUnlockCondition {
  type: BadgeUnlockType;
  value: number;
}

@Schema({ timestamps: true })
export class Badge extends Document {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({
    required: true,
    enum: BadgeCategory,
    default: BadgeCategory.BEGINNER,
  })
  category!: BadgeCategory;

  @Prop({
    type: Object,
    required: true,
  })
  unlockCondition!: BadgeUnlockCondition;

  override _id: Types.ObjectId;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);
