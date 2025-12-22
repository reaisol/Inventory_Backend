import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDailySheetExpenseDto {
  @ApiPropertyOptional({ description: 'ID (for updates, omit for new entries)' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Expense description', example: 'Salary' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Expense amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Link to Expense entity (optional)' })
  @IsOptional()
  @IsNumber()
  expenseId?: number;
}


