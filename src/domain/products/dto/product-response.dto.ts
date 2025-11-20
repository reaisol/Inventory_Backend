import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class MetalTypeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

class MetalPurityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

class CategoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

@Exclude()
export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Product ID (unique)',
    example: 'GLD-BAN-2025-0001',
  })
  @Expose()
  productId: string;

  @ApiProperty({ description: 'Product name', example: '22k Gold Necklace' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Metal Type', type: MetalTypeDto })
  @Expose()
  @Type(() => MetalTypeDto)
  metalType: MetalTypeDto;

  @ApiProperty({ description: 'Metal Purity', type: MetalPurityDto })
  @Expose()
  @Type(() => MetalPurityDto)
  metalPurity: MetalPurityDto;

  @ApiProperty({ description: 'Category', type: CategoryDto })
  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @ApiProperty({ description: 'Gross weight in grams', example: 10.5 })
  @Expose()
  grossWeightGm: number;

  @ApiProperty({ description: 'Gross weight in carats', example: 52.5 })
  @Expose()
  grossWeightCt: number;

  @ApiProperty({ description: 'Stone weight in grams', example: 2.5 })
  @Expose()
  stoneWeightGm: number;

  @ApiProperty({ description: 'Stone weight in carats', example: 12.5 })
  @Expose()
  stoneWeightCt: number;

  @ApiProperty({ description: 'Stone cost', example: 5000.0 })
  @Expose()
  stoneCost: number;

  @ApiProperty({ description: 'Wastage percentage', example: 5.0 })
  @Expose()
  wastagePercentage: number;

  @ApiProperty({ description: 'Making charges percentage', example: 15.0 })
  @Expose()
  makingChargesPercentage: number;

  @ApiProperty({ description: 'Barcode', example: '1234567890123' })
  @Expose()
  barcode: string;

  @ApiProperty({ description: 'Product status', example: 'IN_STOCK' })
  @Expose()
  status: string;

  @ApiProperty({ description: 'Additional notes' })
  @Expose()
  additionalNotes: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
