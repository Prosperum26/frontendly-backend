import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const model = this.configService.get<string>(
      'OPENROUTER_MODEL',
      'tencent/hy3:free',
    );

    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not configured');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || '',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Frontendly',
      },
    });
    this.model = model;
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
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

      return content;
    } catch (error: any) {
      this.logger.error('Error calling OpenRouter API:', error);

      // Log more details about the error
      if (error.response) {
        this.logger.error(
          `OpenRouter API Error Status: ${error.response.status}`,
        );
        this.logger.error(
          `OpenRouter API Error Data: ${JSON.stringify(error.response.data)}`,
        );
      }

      throw new Error('Failed to get AI response');
    }
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
}
