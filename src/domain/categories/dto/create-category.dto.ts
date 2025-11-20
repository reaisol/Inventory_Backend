import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Necklace' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category code (unique)', example: 'NECKLACE' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Necklace category',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
