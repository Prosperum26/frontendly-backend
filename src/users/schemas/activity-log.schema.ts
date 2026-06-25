import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

export enum ActivityType {
  STAGE_COMPLETED = 'stage_completed',
  LESSON_COMPLETED = 'lesson_completed',
  DAILY_LOGIN = 'daily_login',
  CHALLENGE_WON = 'challenge_won',
  STREAK_ACHIEVED = 'streak_achieved',
  BADGE_EARNED = 'badge_earned',
  PERFECT_VISUAL = 'perfect_visual',
}

@Schema({ timestamps: { createdAt: 'timestamp' } })
export class ActivityLog {
  @Prop({ required: true })
  userId!: string;

  @Prop({
    required: true,
    enum: ActivityType,
  })
  type!: ActivityType;

  @Prop({ required: true })
  description!: string;

  timestamp!: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
