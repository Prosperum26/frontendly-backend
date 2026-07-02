import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class BoilerplateCode {
  @Prop({ default: '' })
  html!: string;

  @Prop({ default: '' })
  js!: string;
}

export const BoilerplateCodeSchema =
  SchemaFactory.createForClass(BoilerplateCode);

export type LpExerciseDocument = HydratedDocument<LpExercise>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class LpExercise {
  @Prop({ type: String, required: true, unique: true })
  id!: string;

  @Prop({ type: String, required: true })
  stageId!: string;

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'], required: true })
  level!: 'easy' | 'medium' | 'hard';

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  instruction!: string;

  @Prop({ type: BoilerplateCodeSchema, default: {} })
  boilerplateCode!: BoilerplateCode;

  created_at!: Date;
  updated_at!: Date;
}

export const LpExerciseSchema = SchemaFactory.createForClass(LpExercise);

export type RoadmapDocument = HydratedDocument<Roadmap>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Roadmap {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  skillId!: string;

  @Prop({ required: true })
  skillTitle!: string;

  @Prop({ type: [String], default: [] })
  milestoneIds!: string[];

  created_at!: Date;
  updated_at!: Date;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);

@Schema({ _id: false })
export class UnlockedStage {
  @Prop({ required: true })
  stageId!: string;

  @Prop({ default: false })
  theoryCompleted!: boolean;

  @Prop({ default: false })
  theoryXpAwarded!: boolean;

  @Prop({ default: false })
  isPracticeUnlocked!: boolean;

  @Prop({ default: 0 })
  earnedStars!: number;

  @Prop({ default: false })
  hasSubmittedExercise!: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  videoWatchPercentage!: number;

  @Prop({ default: 0, min: 0, max: 100 })
  videoSeekPercentage!: number;

  @Prop({ default: false })
  badgeEarned!: boolean;

  @Prop({ default: false })
  isAutoPassed!: boolean;
}

const UnlockedStageSchema = SchemaFactory.createForClass(UnlockedStage);

export type UserLearningProgressDocument =
  HydratedDocument<UserLearningProgress>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserLearningProgress {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  skillId!: string;

  @Prop({ default: 0 })
  currentXp!: number;

  @Prop({ default: 0 })
  streakDays!: number;

  @Prop({ type: String, default: null })
  lastStreakDate!: string | null;

  @Prop({ type: [String], default: [] })
  badges!: string[];

  @Prop({ type: [Object], default: [] })
  earnedBadges!: Array<{
    badgeId: string;
    name: string;
    icon: string;
    earnedAt: Date;
  }>;

  @Prop({ type: [Object], default: [] })
  completedMilestones!: Array<{
    milestoneId: string;
    completedAt: Date;
    badgeId: string;
  }>;

  @Prop({ default: 0 })
  totalCompletedStages!: number;

  @Prop({ type: String, default: null })
  lastActiveStageId!: string | null;

  @Prop({ type: String, default: null })
  lastActiveMilestoneId!: string | null;

  @Prop({ default: false })
  placementTestCompleted!: boolean;

  @Prop({ type: String, default: null })
  skipToMilestoneId!: string | null;

  @Prop({ default: 0, min: 0, max: 100 })
  introVideoWatchPercentage!: number;

  @Prop({ default: 0, min: 0, max: 100 })
  introVideoSeekPercentage!: number;

  @Prop({ default: false })
  introVideoXpAwarded!: boolean;

  @Prop({ type: [UnlockedStageSchema], default: [] })
  unlockedStages!: UnlockedStage[];

  @Prop({ type: [Object], default: [] })
  personalizedLearningPath!: Array<{
    canonicalLessonId: string;
    stageId: string;
    exerciseId: string;
    status: 'auto_passed' | 'required' | 'locked';
  }>;

  @Prop({ type: [String], default: [] })
  studyPlan!: string[];

  created_at!: Date;
  updated_at!: Date;
}

export const UserLearningProgressSchema =
  SchemaFactory.createForClass(UserLearningProgress);
