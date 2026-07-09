import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true })
  session_id!: Types.ObjectId;

  @Prop({ required: true })
  exercise_id!: string;

  @Prop({
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  })
  role!: 'user' | 'assistant';

  @Prop({ required: true })
  content!: string;

  createdAt!: Date;
  updatedAt!: Date;
  _id!: Types.ObjectId;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
