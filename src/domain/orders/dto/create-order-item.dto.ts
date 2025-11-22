import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({
    description: 'Quantity to sell (for bulk items, default: 1)',
    example: 10,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
