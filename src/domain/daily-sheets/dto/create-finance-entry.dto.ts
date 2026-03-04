import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinanceEntryDto {
  @ApiPropertyOptional({
    description: 'ID (for updates, omit for new entries)',
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ enum: ['IN', 'OUT'], description: 'Finance entry type' })
  @IsEnum(['IN', 'OUT'])
  type: 'IN' | 'OUT';

  @ApiProperty({
    description: 'Description',
    example: 'Main Branch money received',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  amount: number;
}
