import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class SalesMetricDto {
  @ApiProperty({ description: 'Current value', example: 1478050 })
  @Expose()
  value: number;

  @ApiProperty({
    description: 'Percentage change from last month',
    example: 5.2,
  })
  @Expose()
  change: number;

  @ApiProperty({ description: 'Whether the change is positive', example: true })
  @Expose()
  isPositive: boolean;
}

class SalesTrendDataPointDto {
  @ApiProperty({ description: 'Date', example: '2025-11-18' })
  @Expose()
  date: string;

  @ApiProperty({
    description: 'Sales by metal type',
    example: { GOLD: 250000, SILVER: 50000 },
  })
  @Expose()
  salesByMetal: Record<string, number>;
}

class CategoryRevenueDto {
  @ApiProperty({ description: 'Category name', example: 'Necklace' })
  @Expose()
  category: string;

  @ApiProperty({ description: 'Revenue amount', example: 950000 })
  @Expose()
  revenue: number;
}

class MetalCreditDto {
  @ApiProperty({ description: 'Metal type name', example: 'Gold' })
  @Expose()
  metalType: string;

  @ApiProperty({ description: 'Metal type code', example: 'GOLD' })
  @Expose()
  metalCode: string;

  @ApiProperty({ description: 'Credit amount', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  credit: SalesMetricDto;
}

class MetalSoldDto {
  @ApiProperty({ description: 'Metal type name', example: 'Gold' })
  @Expose()
  metalType: string;

  @ApiProperty({ description: 'Metal type code', example: 'GOLD' })
  @Expose()
  metalCode: string;

  @ApiProperty({ description: 'Metal sold in grams', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  sold: SalesMetricDto;
}

@Expose()
export class SalesDashboardResponseDto {
  @ApiProperty({ description: 'Total sales for today', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  totalSalesToday: SalesMetricDto;

  @ApiProperty({
    description: 'Metal sold by metal type (in grams)',
    type: [MetalSoldDto],
  })
  @Expose()
  @Type(() => MetalSoldDto)
  metalSold: MetalSoldDto[];

  @ApiProperty({
    description: 'Metal credits by metal type',
    type: [MetalCreditDto],
  })
  @Expose()
  @Type(() => MetalCreditDto)
  metalCredits: MetalCreditDto[];

  @ApiProperty({
    description: 'Sales trend data over time',
    type: [SalesTrendDataPointDto],
  })
  @Expose()
  @Type(() => SalesTrendDataPointDto)
  salesTrend: SalesTrendDataPointDto[];

  @ApiProperty({
    description: 'Top categories by revenue',
    type: [CategoryRevenueDto],
  })
  @Expose()
  @Type(() => CategoryRevenueDto)
  topCategoriesByRevenue: CategoryRevenueDto[];
}
