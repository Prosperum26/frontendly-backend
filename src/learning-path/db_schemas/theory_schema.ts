import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// ============================================================
// ReferenceLink — link tài liệu tham khảo trong Theory
// ============================================================
@Schema({ _id: false })
export class ReferenceLink {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ type: String, enum: ['doc', 'video'], default: 'doc' })
  type!: 'doc' | 'video';
}

export const ReferenceLinkSchema = SchemaFactory.createForClass(ReferenceLink);

// ============================================================
// Theory Schema — nội dung lý thuyết của 1 Stage
// ============================================================
export type TheoryDocument = HydratedDocument<Theory>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Theory {
  @Prop({ type: String, required: true, unique: true })
  stageId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  contentHtml!: string;

  @Prop({ default: '' })
  proTips!: string;

  // Phase 2: optional intro video URL; 80% watch threshold awards XP
  @Prop({ default: '' })
  videoUrl!: string;

  @Prop({ type: [ReferenceLinkSchema], default: [] })
  referenceLinks!: ReferenceLink[];

  created_at!: Date;
  updated_at!: Date;
}

export const TheorySchema = SchemaFactory.createForClass(Theory);
