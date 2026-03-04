import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDailySheetTransactionDto } from './create-daily-sheet-transaction.dto';
import { CreateFinanceEntryDto } from './create-finance-entry.dto';
import { CreateDailySheetExpenseDto } from './create-daily-sheet-expense.dto';

export class UpdateDailySheetDto {
  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Lock status' })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Manual closing gold weight override' })
  @IsOptional()
  @IsNumber()
  closingGoldWeightManual?: number;

  @ApiPropertyOptional({ description: 'Manual closing gold value override' })
  @IsOptional()
  @IsNumber()
  closingGoldValueManual?: number;

  @ApiPropertyOptional({ description: 'Manual closing silver weight override' })
  @IsOptional()
  @IsNumber()
  closingSilverWeightManual?: number;

  @ApiPropertyOptional({ description: 'Manual closing silver value override' })
  @IsOptional()
  @IsNumber()
  closingSilverValueManual?: number;

  @ApiPropertyOptional({ description: 'Manual closing cash override' })
  @IsOptional()
  @IsNumber()
  closingCashManual?: number;

  @ApiPropertyOptional({ description: 'Manual closing online override' })
  @IsOptional()
  @IsNumber()
  closingOnlineManual?: number;

  @ApiPropertyOptional({
    description: 'Whether closing balance is auto-calculated',
  })
  @IsOptional()
  @IsBoolean()
  closingBalanceAutoCalculated?: boolean;

  // Old Inventory Movements (sent to karigar/refiner and received back)
  @ApiPropertyOptional({
    description: 'Old inventory gold weight sent out to karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventorySentOutGoldWeight?: number;

  @ApiPropertyOptional({
    description: 'Old inventory gold value sent out to karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventorySentOutGoldValue?: number;

  @ApiPropertyOptional({
    description: 'Old inventory silver weight sent out to karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventorySentOutSilverWeight?: number;

  @ApiPropertyOptional({
    description: 'Old inventory silver value sent out to karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventorySentOutSilverValue?: number;

  @ApiPropertyOptional({
    description: 'Old inventory gold weight received back from karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventoryReceivedGoldWeight?: number;

  @ApiPropertyOptional({
    description: 'Old inventory gold value received back from karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventoryReceivedGoldValue?: number;

  @ApiPropertyOptional({
    description:
      'Old inventory silver weight received back from karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventoryReceivedSilverWeight?: number;

  @ApiPropertyOptional({
    description:
      'Old inventory silver value received back from karigar/refiner',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  oldInventoryReceivedSilverValue?: number;

  @ApiPropertyOptional({
    description: 'Transaction entries to add/update',
    type: [CreateDailySheetTransactionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDailySheetTransactionDto)
  transactions?: CreateDailySheetTransactionDto[];

  @ApiPropertyOptional({
    description: 'Finance entries to add',
    type: [CreateFinanceEntryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFinanceEntryDto)
  financeEntries?: CreateFinanceEntryDto[];

  @ApiPropertyOptional({
    description: 'Expense entries to add',
    type: [CreateDailySheetExpenseDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDailySheetExpenseDto)
  expenses?: CreateDailySheetExpenseDto[];
}
