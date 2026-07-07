import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AiChatController } from './controllers/ai-chat.controller';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { AiChatService } from './services/ai-chat.service';
import { OpenRouterService } from './services/openrouter.service';
import {
  StageProgress,
  StageProgressSchema,
} from '@/users/schemas/stage-progress.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: StageProgress.name, schema: StageProgressSchema },
    ]),
  ],
  controllers: [AiChatController],
  providers: [AiChatService, OpenRouterService],
  exports: [AiChatService],
})
export class AiChatModule {}
