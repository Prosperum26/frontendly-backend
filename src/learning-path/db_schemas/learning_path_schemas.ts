import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// ============================================================
// BoilerplateCode — code mẫu cho bài tập
// ============================================================
@Schema({ _id: false })
export class BoilerplateCode {
  @Prop({ default: '' })
  html: string;

  @Prop({ default: '' })
  js: string;
}

export const BoilerplateCodeSchema =
  SchemaFactory.createForClass(BoilerplateCode);

// ============================================================
// LpExercise Schema — bài tập practice của 1 Stage
// (Dùng tên LpExercise để tránh conflict với Exercise có sẵn)
// ============================================================
export type LpExerciseDocument = HydratedDocument<LpExercise>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class LpExercise {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  stageId: string;

  @Prop({
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  })
  level: 'easy' | 'medium' | 'hard';

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  instruction: string;

  @Prop({ type: BoilerplateCodeSchema, default: {} })
  boilerplateCode: BoilerplateCode;

  created_at: Date;
  updated_at: Date;
}

export const LpExerciseSchema = SchemaFactory.createForClass(LpExercise);

// ============================================================
// Roadmap Schema — lộ trình học tập của 1 skill
// ============================================================
export type RoadmapDocument = HydratedDocument<Roadmap>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Roadmap {
  @Prop({ type: String, required: true, unique: true })
  skillId: string;

  @Prop({ required: true })
  skillTitle: string;

  @Prop({ type: [String], default: [] })
  milestoneIds: string[];

  created_at: Date;
  updated_at: Date;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);

// ============================================================
// UserLearningProgress Schema — tiến độ học của 1 user
// ============================================================
export type UserLearningProgressDocument =
  HydratedDocument<UserLearningProgress>;

@Schema({ _id: false })
export class UnlockedStage {
  @Prop({ required: true })
  stageId: string;

  @Prop({ default: false })
  isPracticeUnlocked: boolean;

  @Prop({ default: 0 })
  earnedStars: number;
}

const UnlockedStageSchema = SchemaFactory.createForClass(UnlockedStage);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserLearningProgress {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  skillId: string;

  @Prop({ default: 0 })
  currentXp: number;

  @Prop({ default: 0 })
  streakDays: number;

  @Prop({ type: [UnlockedStageSchema], default: [] })
  unlockedStages: UnlockedStage[];

  created_at: Date;
  updated_at: Date;
}

export const UserLearningProgressSchema = SchemaFactory.createForClass(
  UserLearningProgress,
);
