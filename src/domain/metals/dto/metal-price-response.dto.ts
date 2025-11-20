import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

class MetalPurityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

@Exclude()
export class MetalPriceResponseDto {
  @ApiProperty({ description: 'Metal Price ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Metal Purity', type: MetalPurityDto })
  @Expose()
  metalPurity: MetalPurityDto;

  @ApiProperty({ description: 'Price per gram', example: 7200.0 })
  @Expose()
  pricePerGram: number;

  @ApiProperty({ description: 'Effective date', example: '2025-01-01' })
  @Expose()
  effectiveDate: Date;

  @ApiProperty({ description: 'Is active', example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
