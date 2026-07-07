import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { Types } from 'mongoose';

import { ChatHistoryResponseDto } from '../dtos/chat-history.dto';
import { ChatRequestDto } from '../dtos/chat-request.dto';
import { ChatResponseDto } from '../dtos/chat-response.dto';
import { QuotaResponseDto } from '../dtos/quota-response.dto';
import { AiChatService } from '../services/ai-chat.service';
import { ReqUser } from '@/auth/decorators';

@Controller({
  path: 'ai-chat',
  version: '1',
})
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);

  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  async chat(
    @ReqUser('userId') userId: Types.ObjectId,
    @Body() dto: ChatRequestDto,
  ): Promise<{ success: boolean; data: ChatResponseDto }> {
    try {
      const result = await this.aiChatService.chat(userId, dto);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error in AI chat:', error);
      throw error;
    }
  }

  @Get('sessions')
  async getSessions(
    @ReqUser('userId') userId: Types.ObjectId,
  ): Promise<{ success: boolean; data: ChatHistoryResponseDto }> {
    try {
      const result = await this.aiChatService.getSessions(userId);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error getting chat sessions:', error);
      throw error;
    }
  }

  @Get('sessions/:sessionId/messages')
  async getSessionMessages(
    @ReqUser('userId') userId: Types.ObjectId,
    @Param('sessionId') sessionId: string,
  ): Promise<{ success: boolean; data: ChatHistoryResponseDto }> {
    try {
      const result = await this.aiChatService.getSessionMessages(
        userId,
        sessionId,
      );
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error getting session messages:', error);
      throw error;
    }
  }

  @Post('sessions')
  async createSession(
    @ReqUser('userId') userId: Types.ObjectId,
  ): Promise<{ success: boolean; data: { sessionId: string } }> {
    try {
      const sessionId = await this.aiChatService.createSession(userId);
      return { success: true, data: { sessionId } };
    } catch (error) {
      this.logger.error('Error creating chat session:', error);
      throw error;
    }
  }

  @Get('quota')
  async getQuota(
    @ReqUser('userId') userId: Types.ObjectId,
  ): Promise<{ success: boolean; data: QuotaResponseDto }> {
    try {
      const result = await this.aiChatService.getQuota(userId);
      this.logger.log(
        `Quota check for user ${userId}: ${result.remainingQuota}/${result.dailyLimit} remaining`,
      );
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error getting quota:', error);
      throw error;
    }
  }

  @Post('reset-quota')
  async resetQuota(
    @ReqUser('userId') userId: Types.ObjectId,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.aiChatService.resetQuota(userId);
      return { success: true, message: 'Quota reset successfully' };
    } catch (error) {
      this.logger.error('Error resetting quota:', error);
      throw error;
    }
  }
}
