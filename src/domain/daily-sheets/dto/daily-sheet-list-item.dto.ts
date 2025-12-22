import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class DailySheetListItemDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  date: Date;

  @ApiProperty()
  @Expose()
  openingGoldWeight: number;

  @ApiProperty()
  @Expose()
  openingGoldValue: number;

  @ApiProperty()
  @Expose()
  openingSilverWeight: number;

  @ApiProperty()
  @Expose()
  openingSilverValue: number;

  @ApiProperty()
  @Expose()
  openingCash: number;

  @ApiProperty()
  @Expose()
  openingOnline: number;

  @ApiProperty()
  @Expose()
  closingGoldWeight: number;

  @ApiProperty()
  @Expose()
  closingGoldValue: number;

  @ApiProperty()
  @Expose()
  closingSilverWeight: number;

  @ApiProperty()
  @Expose()
  closingSilverValue: number;

  @ApiProperty()
  @Expose()
  closingCash: number;

  @ApiProperty()
  @Expose()
  closingOnline: number;

  @ApiProperty()
  @Expose()
  isLocked: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

