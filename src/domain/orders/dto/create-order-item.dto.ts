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

  @ApiPropertyOptional({
    description: 'Custom sold weight in grams (for bulk items). If provided, overrides the default weightPerItem × quantity calculation.',
    example: 180.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  soldWeightGm?: number;
}
