export class ChatMessageDto {
  _id!: string;
  role!: 'user' | 'assistant';
  content!: string;
  exercise_id!: string;
  created_at!: Date;
}

export class ChatSessionDto {
  _id!: string;
  exercise_ids!: string[];
  message_count!: number;
  created_at!: Date;
  updated_at!: Date;
}

export class ChatHistoryResponseDto {
  sessions!: ChatSessionDto[];
  messages?: ChatMessageDto[];
}
