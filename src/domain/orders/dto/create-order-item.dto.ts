import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
