import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailySheetDto {
  @ApiProperty({ description: 'Date of the daily sheet', example: '2025-11-26' })
  @IsDateString()
  date: string;
}


