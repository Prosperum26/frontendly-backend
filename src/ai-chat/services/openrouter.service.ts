import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/naming-convention
import OpenAI from 'openai';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly primaryOpenAI: OpenAI;
  private readonly backupOpenAI: OpenAI | null;
  private readonly model: string;
  private readonly hasBackup: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const backupApiKey = this.configService.get<string>(
      'OPENROUTER_BACKUP_API_KEY',
    );
    const model = this.configService.get<string>(
      'OPENROUTER_MODEL',
      'tencent/hy3:free',
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

    this.model = model;
    this.hasBackup = !!backupApiKey;
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
    try {
      return await this.chatWithClient(
        this.primaryOpenAI,
        'primary',
        messages,
        systemPrompt,
      );
    } catch (primaryError: any) {
      this.logger.error('Primary OpenRouter API failed:', primaryError);

      if (this.hasBackup) {
        this.logger.warn('Attempting to use backup OpenRouter API...');
        try {
          return await this.chatWithClient(
            this.backupOpenAI!,
            'backup',
            messages,
            systemPrompt,
          );
        } catch (backupError: any) {
          this.logger.error('Backup OpenRouter API also failed:', backupError);
          throw new Error('Both primary and backup OpenRouter APIs failed');
        }
      } else {
        throw new Error(
          'Primary OpenRouter API failed and no backup available',
        );
      }
    }
  }

  private async chatWithClient(
    client: OpenAI,
    clientType: 'primary' | 'backup',
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
  ): Promise<string> {
    try {
      const response = await client.chat.completions.create({
        model: this.model,
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

      if (clientType === 'backup') {
        this.logger.log('Successfully used backup OpenRouter API');
      }

      return content;
    } catch (error: any) {
      this.logger.error(`Error calling ${clientType} OpenRouter API:`, error);

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
