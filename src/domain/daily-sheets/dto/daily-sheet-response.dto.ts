import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DailySheetTransactionDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  transactionDate: Date;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  goldWeight: number;

  @ApiProperty()
  @Expose()
  goldRate?: number;

  @ApiProperty()
  @Expose()
  goldValue: number;

  @ApiPropertyOptional()
  @Expose()
  productId?: number;

  @ApiPropertyOptional()
  @Expose()
  categoryId?: number;

  @ApiPropertyOptional()
  @Expose()
  categoryName?: string;

  @ApiPropertyOptional()
  @Expose()
  quantity?: number;

  @ApiProperty()
  @Expose()
  silverWeight: number;

  @ApiProperty()
  @Expose()
  silverRate?: number;

  @ApiProperty()
  @Expose()
  silverValue: number;

  @ApiProperty()
  @Expose()
  makingCharges: number;

  @ApiProperty()
  @Expose()
  oldGoldWeight: number;

  @ApiProperty()
  @Expose()
  oldGoldValue: number;

  @ApiProperty()
  @Expose()
  oldSilverWeight: number;

  @ApiProperty()
  @Expose()
  oldSilverValue: number;

  @ApiProperty()
  @Expose()
  grandTotal: number;

  @ApiPropertyOptional()
  @Expose()
  finalTotal?: number;

  @ApiProperty()
  @Expose()
  discount: number;

  @ApiProperty()
  @Expose()
  cashAmount: number;

  @ApiProperty()
  @Expose()
  onlineAmount: number;

  @ApiPropertyOptional()
  @Expose()
  orderId?: number;

  @ApiPropertyOptional()
  @Expose()
  debit?: number;

  @ApiPropertyOptional()
  @Expose()
  credit?: number;

  @ApiPropertyOptional()
  @Expose()
  balance?: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

class FinanceEntryDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  type: 'IN' | 'OUT';

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

class DailySheetExpenseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiPropertyOptional()
  @Expose()
  expenseId?: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

class CategoryAggregateDto {
  @ApiPropertyOptional()
  @Expose()
  categoryId?: number;

  @ApiPropertyOptional()
  @Expose()
  categoryName?: string;

  @ApiProperty()
  @Expose()
  totalItemsSold: number;

  @ApiProperty()
  @Expose()
  totalGoldWeight: number;

  @ApiProperty()
  @Expose()
  totalOldGoldWeight: number;

  @ApiProperty()
  @Expose()
  totalOldGoldValue: number;

  @ApiProperty()
  @Expose()
  totalRevenue: number;
}

@Exclude()
export class DailySheetResponseDto {
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
  openingBalanceAutoCalculated: boolean;

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
  closingBalanceAutoCalculated: boolean;

  @ApiPropertyOptional()
  @Expose()
  closingGoldWeightManual?: number;

  @ApiPropertyOptional()
  @Expose()
  closingGoldValueManual?: number;

  @ApiPropertyOptional()
  @Expose()
  closingSilverWeightManual?: number;

  @ApiPropertyOptional()
  @Expose()
  closingSilverValueManual?: number;

  @ApiPropertyOptional()
  @Expose()
  closingCashManual?: number;

  @ApiPropertyOptional()
  @Expose()
  closingOnlineManual?: number;

  @ApiProperty()
  @Expose()
  oldInventorySentOutGoldWeight: number;

  @ApiProperty()
  @Expose()
  oldInventorySentOutGoldValue: number;

  @ApiProperty()
  @Expose()
  oldInventorySentOutSilverWeight: number;

  @ApiProperty()
  @Expose()
  oldInventorySentOutSilverValue: number;

  @ApiProperty()
  @Expose()
  oldInventoryReceivedGoldWeight: number;

  @ApiProperty()
  @Expose()
  oldInventoryReceivedGoldValue: number;

  @ApiProperty()
  @Expose()
  oldInventoryReceivedSilverWeight: number;

  @ApiProperty()
  @Expose()
  oldInventoryReceivedSilverValue: number;

  @ApiPropertyOptional()
  @Expose()
  notes?: string;

  @ApiProperty()
  @Expose()
  isLocked: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: [DailySheetTransactionDto] })
  @Expose()
  @Type(() => DailySheetTransactionDto)
  transactions: DailySheetTransactionDto[];

  @ApiProperty({ type: [FinanceEntryDto] })
  @Expose()
  @Type(() => FinanceEntryDto)
  financeEntries: FinanceEntryDto[];

  @ApiProperty({ type: [DailySheetExpenseDto] })
  @Expose()
  @Type(() => DailySheetExpenseDto)
  expenses: DailySheetExpenseDto[];

  @ApiPropertyOptional({ type: [CategoryAggregateDto] })
  @Expose()
  @Type(() => CategoryAggregateDto)
  categoryAggregates?: CategoryAggregateDto[];

  @ApiPropertyOptional()
  @Expose()
  totals?: any;
}


