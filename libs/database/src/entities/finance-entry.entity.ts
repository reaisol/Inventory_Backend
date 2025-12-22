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

@Entity({ name: 'finance_entries' })
@Index(['dailySheetId'])
@Index(['type']) // For filtering IN/OUT
@Index(['dailySheetId', 'type']) // Composite for lookups
@Index(['createdAt']) // For sorting by creation date
export class FinanceEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dailySheetId: number;

  @Column({
    type: 'enum',
    enum: ['IN', 'OUT'],
  })
  type: 'IN' | 'OUT'; // Money received or sent

  @Column({ type: 'text' })
  description: string; // e.g., "Main Branch money received", "Sent money to main branch"

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => DailySheet)
  @JoinColumn({ name: 'dailySheetId' })
  dailySheet: DailySheet;
}

