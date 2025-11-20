import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: '22k Gold Necklace' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Metal Type ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  metalTypeId: number;

  @ApiProperty({ description: 'Metal Purity ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  metalPurityId: number;

  @ApiProperty({ description: 'Category ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'Gross weight in grams', example: 10.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  grossWeightGm: number;

  @ApiPropertyOptional({
    description: 'Gross weight in carats',
    example: 52.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grossWeightCt?: number;

  @ApiPropertyOptional({
    description: 'Stone weight in grams',
    example: 2.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneWeightGm?: number;

  @ApiPropertyOptional({
    description: 'Stone weight in carats',
    example: 12.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneWeightCt?: number;

  @ApiPropertyOptional({
    description: 'Stone cost in INR',
    example: 5000.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneCost?: number;

  @ApiPropertyOptional({
    description: 'Wastage percentage',
    example: 5.0,
    default: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wastagePercentage?: number;

  @ApiPropertyOptional({
    description: 'Making charges percentage',
    example: 15.0,
    default: 15.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  makingChargesPercentage?: number;

  @ApiPropertyOptional({
    description: 'Barcode',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Special design with intricate patterns',
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
