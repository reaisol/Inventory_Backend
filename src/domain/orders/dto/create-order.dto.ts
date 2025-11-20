import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@app/database';
import { CreateOrderItemDto } from './create-order-item.dto';
import { CreateExchangeDto } from './create-exchange.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Customer ID (nullable for walk-in customers)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({
    description: 'Array of product IDs to add to order',
    type: [CreateOrderItemDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description: 'Exchange details (old gold/silver)',
    type: [CreateExchangeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExchangeDto)
  exchanges?: CreateExchangeDto[];

  @ApiPropertyOptional({
    description: 'Discount amount',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Special instructions',
  })
  @IsOptional()
  notes?: string;
}
