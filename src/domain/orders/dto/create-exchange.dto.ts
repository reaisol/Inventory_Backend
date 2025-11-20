import { IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExchangeType } from '@app/database';

export class CreateExchangeDto {
  @ApiProperty({
    description: 'Exchange type',
    example: 'GOLD',
    enum: ExchangeType,
  })
  @IsNotEmpty()
  @IsEnum(ExchangeType)
  exchangeType: ExchangeType;

  @ApiProperty({ description: 'Metal Purity ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  metalPurityId: number;

  @ApiProperty({ description: 'Weight in grams', example: 10.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weightGm: number;
}
