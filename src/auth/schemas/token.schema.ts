import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Types } from 'mongoose';

import { User } from '@/users/schemas';

@Schema({ timestamps: true })
export class Token {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: () => dayjs().add(30, 'minute').toDate() })
  expiredAt!: Date;

  _id!: Types.ObjectId;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
