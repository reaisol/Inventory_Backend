import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class WeightDetailsDto {
  @Expose()
  @ApiProperty()
  goldWeight: number;

  @Expose()
  @ApiProperty()
  goldPricePerGram: number;

  @Expose()
  @ApiProperty()
  silverWeight: number;

  @Expose()
  @ApiProperty()
  silverPricePerGram: number;
}

@Exclude()
export class TransactionLineItemDto {
  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  category: string;

  @Expose()
  @Type(() => WeightDetailsDto)
  @ApiProperty({ type: WeightDetailsDto })
  weights: WeightDetailsDto;

  @Expose()
  @ApiProperty()
  oneGramRate: number;

  @Expose()
  @ApiProperty()
  makingChargesTotal: number;

  @Expose()
  @ApiProperty()
  oldGoldWeight: number;

  @Expose()
  @ApiProperty()
  oldGoldValue: number;

  @Expose()
  @ApiProperty()
  oldSilverWeight: number;

  @Expose()
  @ApiProperty()
  oldSilverValue: number;

  @Expose()
  @ApiProperty()
  grandTotal: number;

  @Expose()
  @ApiProperty()
  discount: number;

  @Expose()
  @ApiProperty()
  finalTotal: number;

  @Expose()
  @ApiProperty()
  online: number;

  @Expose()
  @ApiProperty()
  cash: number;

  @Expose()
  @ApiProperty()
  debit: number;

  @Expose()
  @ApiProperty()
  credit: number;

  @Exclude()
  @ApiProperty()
  balance: number;
}

@Exclude()
export class DailySheetByDateResponseDto {
  @Expose()
  @ApiProperty()
  date: string;

  @Expose()
  @ApiProperty()
  openingCash: string;

  @Expose()
  @ApiProperty()
  totalCredit: number;

  @Expose()
  @ApiProperty()
  totalDebit: number;

  @Expose()
  @ApiProperty()
  closingCash: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @Type(() => TransactionLineItemDto)
  @ApiProperty({ type: [TransactionLineItemDto] })
  list: TransactionLineItemDto[];
}
