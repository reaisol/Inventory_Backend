import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({
    description: 'Setting key (unique)',
    example: 'LOW_STOCK_THRESHOLD',
  })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Setting value',
    example: '2',
  })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiPropertyOptional({
    description: 'Setting description',
    example: 'Fixed threshold for low stock alert',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
