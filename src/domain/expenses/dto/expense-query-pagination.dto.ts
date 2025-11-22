import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ExpenseCategory } from '@app/database';

export class ExpenseQueryPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Expense category',
    enum: ExpenseCategory,
    example: ExpenseCategory.CUSTOMER_SERVICE,
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({
    description: 'Start date (ISO date string)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO date string)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
