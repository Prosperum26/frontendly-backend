import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import dayjs from 'dayjs'; // Sửa lại cách import
import { Types } from 'mongoose';

import { User } from '@/users/schemas';

@Schema({ timestamps: true })
export class Token {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  // Sửa lại cách gọi hàm để ESLint không báo lỗi "any"
  @Prop({ default: () => dayjs().add(1, 'year').toDate() })
  expiredAt!: Date;

  _id!: Types.ObjectId;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
