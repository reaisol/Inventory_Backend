import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { JwtAuthGuard } from '@app/authentication';

@ApiTags('chatbot')
@ApiBearerAuth('JWT-auth')
@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ask the AI assistant a question about the business' })
  @ApiResponse({
    status: 200,
    description: 'AI response retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string' },
      },
    },
  })
  async ask(@Body() askDto: AskQuestionDto): Promise<{ response: string }> {
    const response = await this.chatbotService.ask(askDto.question, askDto.context);
    return { response };
  }
}
