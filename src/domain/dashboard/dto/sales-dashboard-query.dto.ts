import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesDashboardQueryDto {
  @ApiProperty({
    description:
      'Filter by metal type ID (e.g., 1 for Gold, 2 for Silver). If not provided, returns data for all metals.',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  metalTypeId?: number;
}
