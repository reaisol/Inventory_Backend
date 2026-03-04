import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderItemCalculationDto {
  @ApiProperty()
  @Expose()
  productId: number;

  @ApiProperty()
  @Expose()
  productName: string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  unitPrice: number;

  @ApiProperty()
  @Expose()
  totalPrice: number;

  @ApiProperty()
  @Expose()
  basePrice: number;

  @ApiProperty()
  @Expose()
  wastageAmount: number;

  @ApiProperty()
  @Expose()
  makingChargesAmount: number;

  @ApiProperty()
  @Expose()
  stoneCost: number;
}

export class ExchangeCalculationDto {
  @ApiProperty()
  @Expose()
  exchangeType: string;

  @ApiProperty({ nullable: true })
  @Expose()
  metalPurityId: number | null;

  @ApiProperty({ nullable: true })
  @Expose()
  customPurityName: string | null;

  @ApiProperty()
  @Expose()
  weightGm: number;

  @ApiProperty()
  @Expose()
  pricePerGram: number;

  @ApiProperty()
  @Expose()
  totalCredit: number;
}

export class CalculateOrderResponseDto {
  @ApiProperty()
  @Expose()
  subtotal: number;

  @ApiProperty()
  @Expose()
  wastageAmount: number;

  @ApiProperty()
  @Expose()
  makingChargesAmount: number;

  @ApiProperty()
  @Expose()
  makingDiscount: number;

  @ApiProperty()
  @Expose()
  discountedMakingChargesAmount: number;

  @ApiProperty()
  @Expose()
  wastageDiscount: number;

  @ApiProperty()
  @Expose()
  discountedWastageAmount: number;

  @ApiProperty()
  @Expose()
  exchangeCredit: number;

  @ApiProperty()
  @Expose()
  totalAmount: number;

  @ApiProperty({ type: [OrderItemCalculationDto] })
  @Expose()
  items: OrderItemCalculationDto[];

  @ApiProperty({ type: [ExchangeCalculationDto] })
  @Expose()
  exchanges: ExchangeCalculationDto[];
}
