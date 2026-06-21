import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class Question {
  @Prop({ required: true })
  id: number;

  @Prop({
    required: true,
    enum: ['foundation', 'styling', 'component', 'state'],
  })
  competency: 'foundation' | 'styling' | 'component' | 'state';

  @Prop({ required: true, enum: ['easy', 'medium', 'hard'] })
  difficulty: 'easy' | 'medium' | 'hard';

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: Object, required: true })
  options: Record<string, string>;

  @Prop({ required: true })
  correctAnswer: string;
}

@Schema()
class DifficultyWeight {
  @Prop({ type: [Number], required: true })
  questions: number[];

  @Prop({ required: true })
  weight: number;
}

@Schema()
class CriticalGateRule {
  @Prop({ required: true })
  id: string;

  @Prop({
    required: true,
    enum: ['foundation', 'styling', 'component', 'state'],
  })
  competency: 'foundation' | 'styling' | 'component' | 'state';

  @Prop({ required: true })
  minPercentage: number;

  @Prop({ required: true })
  failReason: string;
}

@Schema()
class AdvancementLevel {
  @Prop({ required: true, enum: ['A', 'B', 'C', 'D', 'E'] })
  level: 'A' | 'B' | 'C' | 'D' | 'E';

  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object })
  requiresCompetency?: Record<string, number>;

  @Prop()
  requiresAllGatesPass?: boolean;
}

@Schema()
class ExampleMapping {
  @Prop({ type: [Number], required: true })
  relatedQuestions: number[];

  @Prop({ required: true })
  note: string;
}

@Schema()
class PersonalizationRules {
  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, required: true })
  competencyToMilestoneThreshold: Record<
    string,
    { milestone: string; autoPassThreshold: number }
  >;

  @Prop({ type: [String], required: true })
  perExerciseAutoPassAlgorithm: string[];

  @Prop({ type: Object, required: true })
  exampleMapping: Record<string, ExampleMapping>;
}

export type EntranceTestDocument = EntranceTest & Document;

@Schema({ timestamps: true })
export class EntranceTest {
  @Prop({ required: true })
  test_id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [SchemaFactory.createForClass(Question)], required: true })
  questions: Question[];

  @Prop({ type: Object, required: true })
  questionMapping: Record<string, number[]>;

  @Prop({ type: Object, required: true })
  difficultyWeight: Record<string, DifficultyWeight>;

  @Prop({ type: Object, required: true })
  lessonMapping: Record<string, string>;

  @Prop({ type: Object, required: true })
  lessonToExerciseId: Record<string, string>;

  @Prop({
    type: [SchemaFactory.createForClass(CriticalGateRule)],
    required: true,
  })
  criticalGateRules: CriticalGateRule[];

  @Prop({
    type: [SchemaFactory.createForClass(AdvancementLevel)],
    required: true,
  })
  advancementLevels: AdvancementLevel[];

  @Prop({
    type: SchemaFactory.createForClass(PersonalizationRules),
    required: true,
  })
  personalizationRules: PersonalizationRules;

  @Prop({ type: Object })
  outputSchemaExample?: any;
}

export const EntranceTestSchema = SchemaFactory.createForClass(EntranceTest);
