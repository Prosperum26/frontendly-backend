import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop()
  googleId!: string;

  @Prop()
  firstName!: string;

  @Prop()
  lastName!: string;

  @Prop()
  avatarUrl!: string;

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

  @Prop({
    type: {
      totalLearningTime: { type: Number, default: 0 },
      coursesCompleted: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      lastActiveAt: { type: Date, default: Date.now },
    },
    default: () => ({
      totalLearningTime: 0,
      coursesCompleted: 0,
      streakDays: 0,
      lastActiveAt: new Date(),
    }),
  })
  stats: {
    totalLearningTime?: number;
    coursesCompleted?: number;
    streakDays?: number;
    lastActiveAt?: Date;
  };

  @Prop({
    type: {
      passwordHash: { type: String, default: '' },
      lastPasswordChange: { type: Date, default: Date.now },
    },
    default: () => ({
      passwordHash: '',
      lastPasswordChange: new Date(),
    }),
  })
  credentials: {
    passwordHash?: string;
    lastPasswordChange?: Date;
  };

  @Prop({ default: [] })
  social_accounts: Array<{
    provider: string;
    providerId: string;
    linkedAt: Date;
  }>;

  @Prop({ default: [] })
  skills: Array<{
    name: string;
    level: number;
    earnedAt: Date;
  }>;

  @Prop({ default: [] })
  badges: Array<{
    badgeId: Types.ObjectId;
    earnedAt: Date;
  }>;

  @Prop({
    type: {
      currentStage: { type: Number, default: 0 },
      maxUnlockedStage: { type: Number, default: 0 },
      completedStages: { type: [Number], default: [] },
      totalProgress: { type: Number, default: 0 },
      lastAccessedAt: { type: Date, default: Date.now },
    },
    default: () => ({
      currentStage: 0,
      maxUnlockedStage: 0,
      completedStages: [],
      totalProgress: 0,
      lastAccessedAt: new Date(),
    }),
  })
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
