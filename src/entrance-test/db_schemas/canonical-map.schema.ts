import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class CanonicalMapEntry {
  @Prop({ required: true })
  milestoneId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  exerciseId: string;

  @Prop({ type: [Number], required: true })
  questionIds: number[];
}

export type CanonicalMapDocument = CanonicalMap & Document;

@Schema({ timestamps: true })
export class CanonicalMap {
  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  order: string[];

  @Prop({ type: Object, required: true })
  map: Record<string, CanonicalMapEntry>;

  @Prop({ type: Object, required: true })
  milestoneToCriticalGate: Record<string, string[]>;

  @Prop({ type: [String], required: true })
  notes: string[];
}

export const CanonicalMapSchema = SchemaFactory.createForClass(CanonicalMap);
