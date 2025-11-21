import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';
import { IsOptional } from 'class-validator';
import { IsNumber } from 'class-validator';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductQueryPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Metal type ID',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  metalTypeId?: number;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'active',
  })
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  status?: string;
}
