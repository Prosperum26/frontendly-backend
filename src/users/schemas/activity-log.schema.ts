import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

@Schema({ timestamps: { createdAt: 'timestamp' } })
export class ActivityLog {
  @Prop({ required: true })
  userId!: string;

  @Prop({
    required: true,
    enum: ['lesson_completed', 'challenge_won', 'streak_achieved'],
  })
  type!: 'lesson_completed' | 'challenge_won' | 'streak_achieved';

  @Prop({ required: true })
  description!: string;

  timestamp!: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
