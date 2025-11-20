import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category name', example: 'Necklace' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Necklace category',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
