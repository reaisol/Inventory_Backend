import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });
    }
  }

  async ask(question: string, context?: string): Promise<string> {
    if (!this.model) {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        return 'I am currently in maintenance mode (API key missing). Please contact the administrator.';
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });
    }

    try {
      const prompt = this.buildPrompt(question, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new InternalServerErrorException(
        'Failed to get response from AI assistant',
      );
    }
  }

  private buildPrompt(question: string, context?: string): string {
    return `
  You are a business data assistant for Bhargava Jewells.
  Answer in 1-2 short sentences using only the numbers from the context.
  No introductions. No "As the Jewells Assistant". No filler words.
  Just the direct answer with the relevant data.

  BUSINESS DATA:
  ${context || 'No data available.'}

  QUESTION:
  ${question}

  ANSWER:
`;
  }
}
