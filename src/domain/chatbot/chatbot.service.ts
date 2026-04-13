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
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    }
  }

  async ask(question: string, context?: string): Promise<string> {
    if (!this.model) {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        return 'I am currently in maintenance mode (API key missing). Please contact the administrator.';
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    }

    try {
      const prompt = this.buildPrompt(question, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new InternalServerErrorException('Failed to get response from AI assistant');
    }
  }

  private buildPrompt(question: string, context?: string): string {
    return `
You are the "Jewells Assistant", a professional AI assistant for "Bhargava Jewells", a premier jewelry business.
Your goal is to help the business owner or staff understand their business better by analyzing the provided data.

RULES:
1. Be professional, concise, and helpful.
2. Only use the provided business data to answer questions. If the data is missing, say you don't have that information yet.
3. If the user asks about sales, stock, or orders, refer to the numbers in the context.
4. If no context is provided, answer generic questions about jewelry business management but remind them to provide specific queries.
5. Format your response clearly using bullet points if needed.

BUSINESS DATA CONTEXT:
${context || 'No specific business data provided for this query.'}

USER QUESTION:
${question}

ASSISTANT RESPONSE:
`;
  }
}
