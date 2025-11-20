import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMetalPriceDto {
  @ApiProperty({ description: 'Metal Purity ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  metalPurityId: number;

  @ApiProperty({ description: 'Price per gram in INR', example: 7200.0 })
  @IsNotEmpty()
  @IsNumber()
  pricePerGram: number;

  @ApiProperty({
    description: 'Effective date for this price',
    example: '2025-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({
    description: 'Whether this price is active',
    example: true,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
