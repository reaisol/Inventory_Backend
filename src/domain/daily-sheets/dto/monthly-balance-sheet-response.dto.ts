import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { DailySheetListItemDto } from './daily-sheet-list-item.dto';

@Exclude()
export class MonthlyBalanceSheetResponseDto {
  @ApiProperty()
  @Expose()
  year: number;

  @ApiProperty()
  @Expose()
  month: number;

  @ApiProperty()
  @Expose()
  monthName: string; // e.g., "January 2025"

  @ApiProperty()
  @Expose()
  totalDays: number; // Total days in month

  @ApiProperty()
  @Expose()
  sheetsCount: number; // Number of daily sheets available

  // Opening Balance (from first day of month)
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

  // Closing Balance (from last day of month)
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

  // Monthly Totals (sum of all days)
  @ApiProperty()
  @Expose()
  totalSalesGoldWeight: number;

  @ApiProperty()
  @Expose()
  totalSalesGoldValue: number;

  @ApiProperty()
  @Expose()
  totalSalesSilverWeight: number;

  @ApiProperty()
  @Expose()
  totalSalesSilverValue: number;

  @ApiProperty()
  @Expose()
  totalExchangesGoldWeight: number; // Old gold from customers

  @ApiProperty()
  @Expose()
  totalExchangesGoldValue: number;

  @ApiProperty()
  @Expose()
  totalExchangesSilverWeight: number;

  @ApiProperty()
  @Expose()
  totalExchangesSilverValue: number;

  @ApiProperty()
  @Expose()
  totalMakingCharges: number;

  @ApiProperty()
  @Expose()
  totalSalesAmount: number; // Total from transactions

  @ApiProperty()
  @Expose()
  totalDiscount: number;

  // Old Inventory Movements (monthly totals)
  @ApiProperty()
  @Expose()
  totalOldInventorySentOutGoldWeight: number;

  @ApiProperty()
  @Expose()
  totalOldInventorySentOutGoldValue: number;

  @ApiProperty()
  @Expose()
  totalOldInventorySentOutSilverWeight: number;

  @ApiProperty()
  @Expose()
  totalOldInventorySentOutSilverValue: number;

  @ApiProperty()
  @Expose()
  totalOldInventoryReceivedGoldWeight: number;

  @ApiProperty()
  @Expose()
  totalOldInventoryReceivedGoldValue: number;

  @ApiProperty()
  @Expose()
  totalOldInventoryReceivedSilverWeight: number;

  @ApiProperty()
  @Expose()
  totalOldInventoryReceivedSilverValue: number;

  // Finance & Expenses (monthly totals)
  @ApiProperty()
  @Expose()
  totalFinanceIn: number;

  @ApiProperty()
  @Expose()
  totalFinanceOut: number;

  @ApiProperty()
  @Expose()
  totalExpenses: number;

  // Cash Flow
  @ApiProperty()
  @Expose()
  netCashFlow: number; // Finance IN - Finance OUT - Expenses

  // Daily Sheets Summary
  @ApiProperty({ type: [DailySheetListItemDto] })
  @Expose()
  @Type(() => DailySheetListItemDto)
  dailySheets: DailySheetListItemDto[];
}
