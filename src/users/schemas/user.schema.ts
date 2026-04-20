import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  googleId: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  avatarUrl: string;

  _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
