import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingResponseDto {
  @ApiProperty({ description: 'Setting ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Setting key',
    example: 'LOW_STOCK_THRESHOLD',
  })
  @Expose()
  key: string;

  @ApiProperty({ description: 'Setting value', example: '2' })
  @Expose()
  value: string;

  @ApiProperty({
    description: 'Setting description',
    example: 'Fixed threshold for low stock alert',
  })
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
