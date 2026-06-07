import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop()
  googleId?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  username: string;

  @Prop()
  name!: string;

  @Prop()
  password?: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ type: Object, default: () => ({}) })
  stats: {
    totalLearningTime?: number;
    coursesCompleted?: number;
    streakDays?: number;
    lastActiveAt?: Date;
  };

  @Prop({ type: Object, default: () => ({}) })
  credentials: {
    passwordHash?: string;
    lastPasswordChange?: Date;
  };

  @Prop({
    type: [{ provider: String, providerId: String, linkedAt: Date }],
    default: () => [],
  })
  social_accounts: Array<{
    provider: string;
    providerId: string;
    linkedAt: Date;
  }>;

  @Prop({
    type: [{ name: String, level: Number, earnedAt: Date }],
    default: () => [],
  })
  skills: Array<{
    name: string;
    level: number;
    earnedAt: Date;
  }>;

  @Prop({
    type: [{ badgeId: Types.ObjectId, earnedAt: Date }],
    default: () => [],
  })
  badges: Array<{
    badgeId: Types.ObjectId;
    earnedAt: Date;
  }>;

  @Prop({ type: Object, default: () => ({}) })
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
