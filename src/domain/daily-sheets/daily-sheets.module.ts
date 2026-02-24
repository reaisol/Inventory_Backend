import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DailySheet,
  DailySheetTransaction,
  FinanceEntry,
  DailySheetExpense,
  Order,
  OrderItem,
  Exchange,
  MetalType,
  MetalPrice,
} from '@app/database';
import { DailySheetsService } from './daily-sheets.service';
import { DailySheetsController } from './daily-sheets.controller';
import { AuthenticationModule } from '@app/authentication';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailySheet,
      DailySheetTransaction,
      FinanceEntry,
      DailySheetExpense,
      Order,
      OrderItem,
      Exchange,
      MetalType,
      MetalPrice,
    ]),
    AuthenticationModule,
  ],
  controllers: [DailySheetsController],
  providers: [DailySheetsService],
  exports: [DailySheetsService],
})
export class DailySheetsModule {}


