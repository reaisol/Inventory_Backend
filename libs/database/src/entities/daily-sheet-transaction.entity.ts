import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DailySheet } from './daily-sheet.entity';
import { Order } from './order.entity';

@Entity({ name: 'daily_sheet_transactions' })
@Index(['dailySheetId'])
@Index(['orderId'])
@Index(['dailySheetId', 'orderId']) // Composite for lookups
@Index(['createdAt']) // For sorting by creation date
export class DailySheetTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dailySheetId: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'text' })
  description: string; // Items/product names

  // Gold details
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  goldWeight: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  goldRate?: number; // price per gram

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  goldValue: number;

  // Silver details
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  silverWeight: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  silverRate?: number; // price per gram

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  silverValue: number;

  // Making charges
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  makingCharges: number;

  // Old Gold (exchange)
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  oldGoldWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  oldGoldValue: number;

  // Old Silver (exchange)
  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  oldSilverWeight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  oldSilverValue: number;

  // Totals
  @Column('decimal', { precision: 10, scale: 2 })
  grandTotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  // Payment split
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cashAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  onlineAmount: number;

  // Optional link to Order (nullable for manual entries)
  @Column({ nullable: true })
  orderId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => DailySheet, (dailySheet) => dailySheet.transactions)
  @JoinColumn({ name: 'dailySheetId' })
  dailySheet: DailySheet;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order?: Order;
}
