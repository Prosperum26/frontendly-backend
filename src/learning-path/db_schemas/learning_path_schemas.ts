import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// ============================================================
// BoilerplateCode — code mẫu cho bài tập
// ============================================================
@Schema({ _id: false })
export class BoilerplateCode {
  @Prop({ default: '' })
  html!: string;

  @Prop({ default: '' })
  js!: string;
}

export const BoilerplateCodeSchema =
  SchemaFactory.createForClass(BoilerplateCode);

// ============================================================
// LpExercise Schema
// ============================================================
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

// ============================================================
// Roadmap Schema
// ============================================================
export type RoadmapDocument = HydratedDocument<Roadmap>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Roadmap {
  @Prop({ type: String, required: true, unique: true })
  skillId!: string;

  @Prop({ required: true })
  skillTitle!: string;

  @Prop({ type: [String], default: [] })
  milestoneIds!: string[];

  created_at!: Date;
  updated_at!: Date;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);

// ============================================================
// UnlockedStage — tiến độ của user tại 1 stage
// ============================================================
@Schema({ _id: false })
export class UnlockedStage {
  @Prop({ required: true })
  stageId!: string;

  @Prop({ default: false })
  isPracticeUnlocked!: boolean;

  @Prop({ default: 0 })
  earnedStars!: number;

  // Phase 2: video intro tracking (0–100)
  @Prop({ default: 0, min: 0, max: 100 })
  videoWatchPercentage!: number;

  // Phase 2: badge earned when stage fully completed (earnedStars >= 3)
  @Prop({ default: false })
  badgeEarned!: boolean;
}

const UnlockedStageSchema = SchemaFactory.createForClass(UnlockedStage);

// ============================================================
// UserLearningProgress Schema
// ============================================================
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

  // Phase 2: date of last streak increment ('YYYY-MM-DD') — prevents double-counting per day
  @Prop({ type: String, default: null })
  lastStreakDate!: string | null;

  // Phase 2: stageIds where badge has been earned
  @Prop({ type: [String], default: [] })
  badges!: string[];

  // Phase 2: resume state — last stage/milestone the user was on
  @Prop({ type: String, default: null })
  lastActiveStageId!: string | null;

  @Prop({ type: String, default: null })
  lastActiveMilestoneId!: string | null;

  // Phase 2: placement test onboarding
  @Prop({ default: false })
  placementTestCompleted!: boolean;

  @Prop({ type: String, default: null })
  skipToMilestoneId!: string | null;

  @Prop({ type: [UnlockedStageSchema], default: [] })
  unlockedStages!: UnlockedStage[];

  created_at!: Date;
  updated_at!: Date;
}

export const UserLearningProgressSchema =
  SchemaFactory.createForClass(UserLearningProgress);
