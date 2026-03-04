import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DailySheetTransaction } from './daily-sheet-transaction.entity';
import { FinanceEntry } from './finance-entry.entity';
import { DailySheetExpense } from './daily-sheet-expense.entity';

@Entity({ name: 'daily_sheets' })
@Index(['date'], { unique: true }) // One sheet per day
@Index(['createdAt']) // For sorting by creation date
@Index(['isLocked']) // For filtering locked/unlocked sheets
export class DailySheet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  date: Date;

  // Opening balance (from previous day's closing)
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  openingGoldWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  openingGoldValue: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  openingSilverWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  openingSilverValue: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  openingCash: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  openingOnline: number;

  @Column({ default: true })
  openingBalanceAutoCalculated: boolean; // was it auto-calc from prev day?

  // Closing balance (calculated from transactions, but can override)
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  closingGoldWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  closingGoldValue: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  closingSilverWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  closingSilverValue: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  closingCash: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  closingOnline: number;

  @Column({ default: true })
  closingBalanceAutoCalculated: boolean; // was it auto-calc from transactions?

  // Manual override for closing balance (used if autoCalculated = false)
  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  closingGoldWeightManual?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  closingGoldValueManual?: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  closingSilverWeightManual?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  closingSilverValueManual?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  closingCashManual?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  closingOnlineManual?: number;

  // Old Inventory Movements (sent to karigar/refiner and received back)
  // Old inventory sent out reduces stock, received back increases stock
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  oldInventorySentOutGoldWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  oldInventorySentOutGoldValue: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  oldInventorySentOutSilverWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  oldInventorySentOutSilverValue: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  oldInventoryReceivedGoldWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  oldInventoryReceivedGoldValue: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  oldInventoryReceivedSilverWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  oldInventoryReceivedSilverValue: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: false })
  isLocked: boolean; // once locked, can't edit

  @Column()
  createdBy: number; // userId who created the sheet

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  user: User;

  @OneToMany(
    () => DailySheetTransaction,
    (transaction) => transaction.dailySheet,
    { cascade: true },
  )
  transactions: DailySheetTransaction[];

  @OneToMany(() => FinanceEntry, (finance) => finance.dailySheet, {
    cascade: true,
  })
  financeEntries: FinanceEntry[];

  @OneToMany(() => DailySheetExpense, (expense) => expense.dailySheet, {
    cascade: true,
  })
  expenses: DailySheetExpense[];
}
