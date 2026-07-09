import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatSessionDocument = HydratedDocument<ChatSession>;

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  exercise_ids!: string[];

  @Prop({ default: 0 })
  message_count!: number;

  createdAt!: Date;
  updatedAt!: Date;
  _id!: Types.ObjectId;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
