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

  @ApiProperty({ description: 'Gold sales amount', example: 250000 })
  @Expose()
  goldSales: number;

  @ApiProperty({ description: 'Silver sales amount', example: 0 })
  @Expose()
  silverSales: number;
}

class CategoryRevenueDto {
  @ApiProperty({ description: 'Category name', example: 'Necklace' })
  @Expose()
  category: string;

  @ApiProperty({ description: 'Revenue amount', example: 950000 })
  @Expose()
  revenue: number;
}

@Expose()
export class SalesDashboardResponseDto {
  @ApiProperty({ description: 'Total sales for today', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  totalSalesToday: SalesMetricDto;

  @ApiProperty({ description: 'Gold sold in grams', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  goldSold: SalesMetricDto;

  @ApiProperty({ description: 'Silver sold in grams', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  silverSold: SalesMetricDto;

  @ApiProperty({ description: 'Old gold credit amount', type: SalesMetricDto })
  @Expose()
  @Type(() => SalesMetricDto)
  oldGoldCredit: SalesMetricDto;

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
