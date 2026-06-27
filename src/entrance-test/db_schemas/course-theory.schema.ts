import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class TheorySection {
  @Prop({ required: true })
  heading: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  code?: string;

  @Prop()
  fileName?: string;
}

@Schema({ _id: false })
class TheoryLesson {
  @Prop({ required: true })
  lessonId: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  relatedExerciseIds: string[];

  @Prop({ type: [SchemaFactory.createForClass(TheorySection)], required: true })
  sections: TheorySection[];

  @Prop({ type: [String], required: true })
  keyTakeaways: string[];
}

@Schema({ _id: false })
class TheoryMilestone {
  @Prop({ required: true })
  milestoneId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [SchemaFactory.createForClass(TheoryLesson)], required: true })
  lessons: TheoryLesson[];
}

export type CourseTheoryDocument = CourseTheory & Document;

@Schema({ timestamps: true })
export class CourseTheory {
  @Prop({ required: true })
  course: string;

  @Prop({
    type: [SchemaFactory.createForClass(TheoryMilestone)],
    required: true,
  })
  milestones: TheoryMilestone[];
}

export const CourseTheorySchema = SchemaFactory.createForClass(CourseTheory);
