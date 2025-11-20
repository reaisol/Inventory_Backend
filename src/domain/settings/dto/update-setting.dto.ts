import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiPropertyOptional({
    description: 'Setting value',
    example: '2',
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    description: 'Setting description',
    example: 'Fixed threshold for low stock alert',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
