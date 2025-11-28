import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class CustomerDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

@Exclude()
class UserDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;
}

class ProductDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;
}

class OrderItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: ProductDto })
  @Type(() => ProductDto)
  product: ProductDto;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({
    description: 'Quantity sold (1 for regular items, 1-N for bulk items)',
    example: 1,
  })
  quantity: number;
}

class ExchangeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  exchangeType: string;

  @ApiProperty({ nullable: true })
  metalPurityId: number | null;

  @ApiProperty({ nullable: true, required: false })
  customPurityName: string | null;

  @ApiProperty({ nullable: true, required: false })
  customPurityPercentage: number | null;

  @ApiProperty()
  weightGm: number;

  @ApiProperty()
  pricePerGram: number;

  @ApiProperty()
  totalCredit: number;
}

@Exclude()
export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-2025-0001',
  })
  @Expose()
  orderNumber: string;

  @ApiProperty({ type: CustomerDto, nullable: true })
  @Expose()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({ type: UserDto })
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty()
  @Expose()
  orderDate: Date;

  @ApiProperty()
  @Expose()
  subtotal: number;

  @ApiProperty()
  @Expose()
  exchangeCredit: number;

  @ApiProperty()
  @Expose()
  wastageAmount: number;

  @ApiProperty()
  @Expose()
  makingChargesAmount: number;

  @ApiProperty()
  @Expose()
  discountAmount: number;

  @ApiProperty()
  @Expose()
  totalAmount: number;

  @ApiProperty()
  @Expose()
  paymentMethod: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  notes: string;

  @ApiProperty({ type: [OrderItemDto] })
  @Expose()
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({ type: [ExchangeDto] })
  @Expose()
  @Type(() => ExchangeDto)
  exchanges: ExchangeDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
