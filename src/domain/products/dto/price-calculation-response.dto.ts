import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PriceCalculationResponseDto {
  @ApiProperty({
    description: 'Base price (net weight × price per gram)',
    example: 72000.0,
  })
  @Expose()
  basePrice: number;

  @ApiProperty({
    description: 'Wastage amount',
    example: 3600.0,
  })
  @Expose()
  wastageAmount: number;

  @ApiProperty({
    description: 'Making charges amount',
    example: 10800.0,
  })
  @Expose()
  makingChargesAmount: number;

  @ApiProperty({
    description: 'Stone cost (if any)',
    example: 5000.0,
  })
  @Expose()
  stoneCost: number;

  @ApiProperty({
    description:
      'Total selling price (base + wastage + making charges + stone cost)',
    example: 91400.0,
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    description: 'Current metal price per gram used for calculation',
    example: 7200.0,
  })
  @Expose()
  pricePerGram: number;

  @ApiProperty({
    description: 'Effective date of the metal price',
    example: '2024-01-01',
  })
  @Expose()
  effectiveDate: Date;
}
