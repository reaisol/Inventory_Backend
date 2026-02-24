import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDailySheetTransactionDto {
  @ApiPropertyOptional({ description: 'ID (for updates, omit for new entries)' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Transaction date', example: '2025-01-01' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ description: 'Description/Items', example: 'BRACELET, RING' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Product ID (if applicable)' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Category ID (preferred for grouping)' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Quantity of items', default: 1 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Gold weight in grams', default: 0 })
  @IsOptional()
  @IsNumber()
  goldWeight?: number;

  @ApiPropertyOptional({ description: 'Gold rate per gram' })
  @IsOptional()
  @IsNumber()
  goldRate?: number;

  @ApiPropertyOptional({ description: 'Gold value', default: 0 })
  @IsOptional()
  @IsNumber()
  goldValue?: number;

  @ApiPropertyOptional({ description: 'Silver weight in grams', default: 0 })
  @IsOptional()
  @IsNumber()
  silverWeight?: number;

  @ApiPropertyOptional({ description: 'Silver rate per gram' })
  @IsOptional()
  @IsNumber()
  silverRate?: number;

  @ApiPropertyOptional({ description: 'Silver value', default: 0 })
  @IsOptional()
  @IsNumber()
  silverValue?: number;

  @ApiPropertyOptional({ description: 'Making charges', default: 0 })
  @IsOptional()
  @IsNumber()
  makingCharges?: number;

  @ApiPropertyOptional({ description: 'Old Gold weight (exchange)', default: 0 })
  @IsOptional()
  @IsNumber()
  oldGoldWeight?: number;

  @ApiPropertyOptional({ description: 'Old Gold value', default: 0 })
  @IsOptional()
  @IsNumber()
  oldGoldValue?: number;

  @ApiPropertyOptional({ description: 'Old Silver weight (exchange)', default: 0 })
  @IsOptional()
  @IsNumber()
  oldSilverWeight?: number;

  @ApiPropertyOptional({ description: 'Old Silver value', default: 0 })
  @IsOptional()
  @IsNumber()
  oldSilverValue?: number;

  @ApiProperty({ description: 'Grand total' })
  @IsNumber()
  grandTotal: number;

  @ApiPropertyOptional({ description: 'Discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ description: 'Cash amount', default: 0 })
  @IsOptional()
  @IsNumber()
  cashAmount?: number;

  @ApiPropertyOptional({ description: 'Online amount', default: 0 })
  @IsOptional()
  @IsNumber()
  onlineAmount?: number;

  @ApiPropertyOptional({ description: 'Order ID (if linked to an order)' })
  @IsOptional()
  @IsNumber()
  orderId?: number;
}


