import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/naming-convention
import OpenAI from 'openai';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly primaryOpenAI: OpenAI;
  private readonly backupOpenAI: OpenAI | null;
  private readonly model1: string;
  private readonly model2: string;
  private readonly hasBackup: boolean;
  private readonly hasModel2: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const backupApiKey = this.configService.get<string>(
      'OPENROUTER_BACKUP_API_KEY',
    );
    this.model1 = this.configService.get<string>(
      'OPENROUTER_MODEL',
      'tencent/hy3:free',
    );
    this.model2 = this.configService.get<string>(
      'OPENROUTER_MODEL_2',
      'google/gemma-2-9b-it:free',
    );

    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not configured');
    }

    if (backupApiKey) {
      this.logger.log('Backup OpenRouter API key configured');
    } else {
      this.logger.warn(
        'OPENROUTER_BACKUP_API_KEY not configured - no backup available',
      );
    }

    if (this.model2) {
      this.logger.log(`Backup model configured: ${this.model2}`);
    } else {
      this.logger.warn(
        'OPENROUTER_MODEL_2 not configured - no backup model available',
      );
    }

    this.primaryOpenAI = new OpenAI({
      apiKey: apiKey || '',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Frontendly',
      },
    });

    this.backupOpenAI = backupApiKey
      ? new OpenAI({
          apiKey: backupApiKey,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Frontendly',
          },
        })
      : null;

    this.hasBackup = !!backupApiKey;
    this.hasModel2 = !!this.model2;
  }

  buildSystemPrompt(
    exerciseTitle: string,
    exerciseDescription: string,
    userCode: string,
    codeTest: string,
  ): string {
    return `You are a helpful coding tutor for React/HTML/CSS/JS exercises.

STRICT RULES:
1. NEVER provide complete solution code. Only give hints and guidance.
2. Focus on helping the user understand the concept and find their own solution.
3. Do not answer questions outside the exercise topic.
4. Be encouraging and patient.
5. If the user is completely stuck, provide small, incremental hints.

EXERCISE CONTEXT:
- Title: ${exerciseTitle}
- Description: ${exerciseDescription}
- User's current code:
\`\`\`
${userCode}
\`\`\`

Reference solution (for context only - do not share this):
\`\`\`
${codeTest}
\`\`\`

Help the user by:
- Identifying what they're trying to achieve
- Pointing out specific issues or missing concepts
- Suggesting next steps without giving the answer
- Explaining relevant concepts if needed`;
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
  ): Promise<string> {
    // Fallback order: model1(primary) -> model1(backup) -> model2(primary) -> model2(backup)
    const attempts: Array<{
      client: OpenAI;
      clientType: 'primary' | 'backup';
      model: string;
    }> = [];

    // Model 1 with primary API
    attempts.push({
      client: this.primaryOpenAI,
      clientType: 'primary',
      model: this.model1,
    });

    // Model 1 with backup API (if available)
    if (this.hasBackup) {
      attempts.push({
        client: this.backupOpenAI!,
        clientType: 'backup',
        model: this.model1,
      });
    }

    // Model 2 with primary API (if available)
    if (this.hasModel2) {
      attempts.push({
        client: this.primaryOpenAI,
        clientType: 'primary',
        model: this.model2,
      });
    }

    // Model 2 with backup API (if both available)
    if (this.hasBackup && this.hasModel2) {
      attempts.push({
        client: this.backupOpenAI!,
        clientType: 'backup',
        model: this.model2,
      });
    }

    const errors: Array<{ attempt: string; error: any }> = [];

    for (const attempt of attempts) {
      try {
        this.logger.log(
          `Attempting ${attempt.clientType} API with model: ${attempt.model}`,
        );
        return await this.chatWithClient(
          attempt.client,
          attempt.clientType,
          messages,
          systemPrompt,
          attempt.model,
        );
      } catch (error: any) {
        const attemptDesc = `${attempt.clientType} API with model ${attempt.model}`;
        this.logger.error(`${attemptDesc} failed:`, error);
        errors.push({ attempt: attemptDesc, error });
      }
    }

    this.logger.error('All AI API attempts failed:', errors);
    throw new Error(
      `All AI API attempts failed. Tried: ${errors.map(e => e.attempt).join(', ')}`,
    );
  }

  private async chatWithClient(
    client: OpenAI,
    clientType: 'primary' | 'backup',
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    model: string,
  ): Promise<string> {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: <const>'system', content: systemPrompt },
          ...messages.map(m => ({
            role: <'user' | 'assistant'>m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      this.logger.log(
        `Successfully used ${clientType} API with model: ${model}`,
      );

      return content;
    } catch (error: any) {
      this.logger.error(
        `Error calling ${clientType} OpenRouter API with model ${model}:`,
        error,
      );

      if (error.response) {
        this.logger.error(
          `${clientType} OpenRouter API Error Status: ${error.response.status}`,
        );
        this.logger.error(
          `${clientType} OpenRouter API Error Data: ${JSON.stringify(error.response.data)}`,
        );
      }

      throw error;
    }
  }
}
