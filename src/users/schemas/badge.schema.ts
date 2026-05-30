import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Badge extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop()
  description?: string;

  override _id: Types.ObjectId;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);
