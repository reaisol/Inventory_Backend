import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @ApiPropertyOptional({
    description: 'Expense description',
    example: 'Coffee for customers',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Expense amount in INR',
    example: 500.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Date when the expense occurred (ISO date string)',
    example: '2025-01-15',
  })
  @IsOptional()
  expenseDate?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the expense',
    example: 'Bought coffee for 10 customers',
  })
  @IsOptional()
  notes?: string;
}
