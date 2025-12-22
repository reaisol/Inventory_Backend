import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class DailySheetQueryPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Start date filter (ISO string)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO string)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by locked status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

