import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model, Types } from 'mongoose';

import { OpenRouterService } from './openrouter.service';
import { ChatHistoryResponseDto } from '../dtos/chat-history.dto';
import { ChatRequestDto } from '../dtos/chat-request.dto';
import { ChatResponseDto } from '../dtos/chat-response.dto';
import { QuotaResponseDto } from '../dtos/quota-response.dto';
import {
  ChatMessage,
  ChatMessageDocument,
} from '../schemas/chat-message.schema';
import {
  ChatSession,
  ChatSessionDocument,
} from '../schemas/chat-session.schema';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private readonly dailyLimit: number;

  constructor(
    @InjectModel(ChatSession.name)
    private readonly chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
    private readonly openRouterService: OpenRouterService,
    private readonly configService: ConfigService,
  ) {
    this.dailyLimit = this.configService.get<number>('AI_CHAT_DAILY_LIMIT', 10);
  }

  async chat(
    userId: Types.ObjectId,
    dto: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    const {
      exerciseId,
      userCode,
      message,
      sessionId,
      exerciseTitle,
      exerciseDescription,
      codeTest,
    } = dto;

    // Check quota
    const quota = await this.getQuota(userId);
    if (quota.remainingQuota <= 0) {
      throw new ForbiddenException('Daily quota exceeded. Try again tomorrow.');
    }

    // Get or create session
    let session: ChatSessionDocument;
    if (sessionId) {
      const foundSession = await this.chatSessionModel.findById(sessionId);
      if (!foundSession?.user_id.equals(userId)) {
        throw new NotFoundException('Session not found');
      }
      session = foundSession;

      // Update exercise_ids if not already present
      if (!session.exercise_ids.includes(exerciseId)) {
        session.exercise_ids.push(exerciseId);
      }
    } else {
      session = await this.chatSessionModel.create({
        user_id: userId,
        exercise_ids: [exerciseId],
        message_count: 0,
      });
    }

    // Save user message
    await this.chatMessageModel.create({
      session_id: session._id,
      exercise_id: exerciseId,
      role: 'user',
      content: message,
    });

    // Get chat history for context
    const recentMessages = await this.chatMessageModel
      .find({ session_id: session._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .sort({ createdAt: 1 });

    const messageHistory = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build system prompt
    const systemPrompt = this.openRouterService.buildSystemPrompt(
      exerciseTitle || 'Exercise',
      exerciseDescription || '',
      userCode,
      codeTest || '',
    );

    // Call AI
    const aiResponse = await this.openRouterService.chat(
      messageHistory,
      systemPrompt,
    );

    // Save AI response
    await this.chatMessageModel.create({
      session_id: session._id,
      exercise_id: exerciseId,
      role: 'assistant',
      content: aiResponse,
    });

    // Update session
    session.message_count += 2; // user + assistant
    await session.save();

    // Return response with updated quota
    const updatedQuota = await this.getQuota(userId);

    return {
      message: aiResponse,
      sessionId: session._id.toString(),
      remainingQuota: updatedQuota.remainingQuota,
    };
  }

  async getSessions(userId: Types.ObjectId): Promise<ChatHistoryResponseDto> {
    const sessions = await this.chatSessionModel
      .find({ user_id: userId })
      .sort({ updatedAt: -1 })
      .lean();

    return {
      sessions: sessions.map(session => ({
        _id: session._id.toString(),
        exercise_ids: session.exercise_ids,
        message_count: session.message_count,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      })),
    };
  }

  async getSessionMessages(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<ChatHistoryResponseDto> {
    const session = await this.chatSessionModel.findById(sessionId);
    if (!session?.user_id.equals(userId)) {
      throw new NotFoundException('Session not found');
    }

    const messages = await this.chatMessageModel
      .find({ session_id: sessionId })
      .sort({ createdAt: 1 })
      .lean();

    return {
      sessions: [
        {
          _id: session._id.toString(),
          exercise_ids: session.exercise_ids,
          message_count: session.message_count,
          created_at: session.createdAt,
          updated_at: session.updatedAt,
        },
      ],
      messages: messages.map(msg => ({
        _id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        exercise_id: msg.exercise_id,
        created_at: msg.createdAt,
      })),
    };
  }

  async createSession(userId: Types.ObjectId): Promise<string> {
    const session = await this.chatSessionModel.create({
      user_id: userId,
      exercise_ids: [],
      message_count: 0,
    });
    return session._id.toString();
  }

  async getQuota(userId: Types.ObjectId): Promise<QuotaResponseDto> {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');

    const userSessions = await this.chatSessionModel
      .find({ user_id: userId })
      .distinct('_id');

    this.logger.log(`User ${userId} has ${userSessions.length} sessions`);

    const messagesToday = await this.chatMessageModel.countDocuments({
      session_id: { $in: userSessions },
      role: 'user',
      createdAt: {
        $gte: today.toDate(),
        $lt: tomorrow.toDate(),
      },
    });

    this.logger.log(
      `User ${userId} has sent ${messagesToday} messages today (limit: ${this.dailyLimit})`,
    );

    const remainingQuota = Math.max(0, this.dailyLimit - messagesToday);

    return {
      remainingQuota,
      dailyLimit: this.dailyLimit,
      resetAt: tomorrow.toDate(),
    };
  }

  async resetQuota(userId: Types.ObjectId): Promise<void> {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');

    const userSessions = await this.chatSessionModel
      .find({ user_id: userId })
      .distinct('_id');

    const result = await this.chatMessageModel.deleteMany({
      session_id: { $in: userSessions },
      role: 'user',
      createdAt: {
        $gte: today.toDate(),
        $lt: tomorrow.toDate(),
      },
    });

    this.logger.log(
      `Reset quota for user ${userId}: deleted ${result.deletedCount} messages`,
    );
  }
}
