import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ required: true })
  refresh_token_hash!: string;

  @Prop()
  device_info!: string;

  @Prop({ required: true, index: { expires: 0 } })
  expires_at!: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
