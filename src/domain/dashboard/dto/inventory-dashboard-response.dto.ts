import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class InventoryFlowDataPointDto {
  @ApiProperty({ description: 'Date', example: '2025-11-17' })
  @Expose()
  date: string;

  @ApiProperty({ description: 'Number of items added', example: 5 })
  @Expose()
  itemsAdded: number;

  @ApiProperty({ description: 'Number of items sold', example: 3 })
  @Expose()
  itemsSold: number;
}

class PurityDistributionDto {
  @ApiProperty({ description: 'Purity name', example: '24K' })
  @Expose()
  purity: string;

  @ApiProperty({ description: 'Stock quantity in grams', example: 1200.5 })
  @Expose()
  stockGm: number;

  @ApiProperty({ description: 'Percentage of total stock', example: 45.5 })
  @Expose()
  percentage: number;
}

class MetalInventoryDto {
  @ApiProperty({ description: 'Metal type name', example: 'Gold' })
  @Expose()
  metalType: string;

  @ApiProperty({ description: 'Metal type code', example: 'GOLD' })
  @Expose()
  metalCode: string;

  @ApiProperty({
    description: 'Inventory value for this metal',
    example: 3500000,
  })
  @Expose()
  inventoryValue: number;

  @ApiProperty({ description: 'Metal stock in grams', example: 1200.5 })
  @Expose()
  stockGm: number;

  @ApiProperty({ description: 'Number of items', example: 15 })
  @Expose()
  items: number;
}

@Expose()
export class InventoryDashboardResponseDto {
  @ApiProperty({
    description: 'Total inventory value in INR (overall or filtered)',
    example: 7138675,
  })
  @Expose()
  totalInventoryValue: number;

  @ApiProperty({
    description: 'Total metal stock in grams (overall or filtered)',
    example: 2448.3,
  })
  @Expose()
  totalMetalStockGm: number;

  @ApiProperty({
    description: 'Total number of items (overall or filtered)',
    example: 30,
  })
  @Expose()
  totalItems: number;

  @ApiProperty({
    description: 'Inventory breakdown by metal type',
    type: [MetalInventoryDto],
  })
  @Expose()
  @Type(() => MetalInventoryDto)
  metalInventory: MetalInventoryDto[];

  @ApiProperty({ description: 'Most stocked category name', example: 'Ring' })
  @Expose()
  mostStockedCategory: string;

  @ApiProperty({
    description: 'Inventory flow trend over last 60 days',
    type: [InventoryFlowDataPointDto],
  })
  @Expose()
  @Type(() => InventoryFlowDataPointDto)
  inventoryFlowTrend: InventoryFlowDataPointDto[];

  @ApiProperty({
    description: 'Stock distribution by purity',
    type: [PurityDistributionDto],
  })
  @Expose()
  @Type(() => PurityDistributionDto)
  stockDistributionByPurity: PurityDistributionDto[];
}
