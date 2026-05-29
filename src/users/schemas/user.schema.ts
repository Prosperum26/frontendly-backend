import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  googleId: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  username: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: () => ({}) })
  stats: {
    totalLearningTime?: number;
    coursesCompleted?: number;
    streakDays?: number;
    lastActiveAt?: Date;
  };

  @Prop({ default: () => ({}) })
  credentials: {
    passwordHash?: string;
    lastPasswordChange?: Date;
  };

  @Prop({ default: () => [] })
  social_accounts: Array<{
    provider: string;
    providerId: string;
    linkedAt: Date;
  }>;

  @Prop({ default: () => [] })
  skills: Array<{
    name: string;
    level: number;
    earnedAt: Date;
  }>;

  @Prop({ default: () => [] })
  badges: Array<{
    badgeId: Types.ObjectId;
    earnedAt: Date;
  }>;

  @Prop({ default: () => ({}) })
  stage_progress: {
    currentStage?: number;
    maxUnlockedStage?: number;
    completedStages?: number[];
    totalProgress?: number;
    lastAccessedAt?: Date;
  };

  _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
