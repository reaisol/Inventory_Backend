import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AskQuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  context?: string;
}
