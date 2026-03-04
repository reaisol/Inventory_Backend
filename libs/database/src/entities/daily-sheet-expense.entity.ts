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
import { Expense } from './expense.entity';

@Entity({ name: 'daily_sheet_expenses' })
@Index(['dailySheetId'])
@Index(['expenseId'])
@Index(['dailySheetId', 'expenseId']) // Composite for lookups
export class DailySheetExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dailySheetId: number;

  @Column({ type: 'text' })
  description: string; // e.g., "Salary", "Rent", "Electrician"

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  // Optional link to Expense entity
  @Column({ nullable: true })
  expenseId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => DailySheet, (dailySheet) => dailySheet.expenses)
  @JoinColumn({ name: 'dailySheetId' })
  dailySheet: DailySheet;

  @ManyToOne(() => Expense, { nullable: true })
  @JoinColumn({ name: 'expenseId' })
  expense?: Expense;
}
