import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: '22k Gold Necklace',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Gross weight in grams', example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grossWeightGm?: number;

  @ApiPropertyOptional({ description: 'Gross weight in carats', example: 52.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grossWeightCt?: number;

  @ApiPropertyOptional({ description: 'Stone weight in grams', example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneWeightGm?: number;

  @ApiPropertyOptional({ description: 'Stone weight in carats', example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneWeightCt?: number;

  @ApiPropertyOptional({ description: 'Stone cost in INR', example: 5000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneCost?: number;

  @ApiPropertyOptional({ description: 'Wastage percentage', example: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wastagePercentage?: number;

  @ApiPropertyOptional({
    description: 'Flat making charges in INR',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  makingChargesAmount?: number;

  @ApiPropertyOptional({ description: 'Barcode', example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiPropertyOptional({
    description: 'Is this a bulk item?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isBulkItem?: boolean;

  @ApiPropertyOptional({
    description: 'Total quantity (for bulk items)',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalQuantity?: number;
}
