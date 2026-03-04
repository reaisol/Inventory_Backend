import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MonthlyBalanceSheetQueryDto {
  @ApiProperty({ description: 'Year', example: 2025 })
  @IsNumber()
  @Type(() => Number)
  year: number;

  @ApiProperty({ description: 'Month (1-12)', example: 1 })
  @IsNumber()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;
}
