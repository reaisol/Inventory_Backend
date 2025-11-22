import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '@app/database';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense description',
    example: 'Coffee for customers',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Expense amount in INR',
    example: 500.0,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Expense category',
    enum: ExpenseCategory,
    example: ExpenseCategory.CUSTOMER_SERVICE,
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiProperty({
    description: 'Date when the expense occurred (ISO date string)',
    example: '2025-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the expense',
    example: 'Bought coffee for 10 customers',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
