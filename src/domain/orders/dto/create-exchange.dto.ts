import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    description:
      'Metal Purity ID (required if using predefined purity, omit for custom purity)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  metalPurityId?: number;

  @ApiPropertyOptional({
    description:
      'Custom purity name (e.g., "18.5K", "Custom", "Unknown") - required if metalPurityId is not provided',
    example: '18.5K',
  })
  @ValidateIf((o) => !o.metalPurityId)
  @IsNotEmpty({
    message: 'customPurityName is required when metalPurityId is not provided',
  })
  @IsString()
  customPurityName?: string;

  @ApiPropertyOptional({
    description: 'Custom purity percentage (optional, if known)',
    example: 75.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPurityPercentage?: number;

  @ApiProperty({ description: 'Weight in grams', example: 10.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weightGm: number;

  @ApiPropertyOptional({
    description:
      'Price per gram (required for custom purity, optional for predefined purity - will use current metal price if not provided)',
    example: 5500.0,
  })
  @ValidateIf((o) => !o.metalPurityId)
  @IsNotEmpty({
    message: 'pricePerGram is required when metalPurityId is not provided',
  })
  @IsNumber()
  @Min(0)
  pricePerGram?: number;
}
