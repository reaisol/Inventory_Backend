import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ExpenseCategory } from './enums/expense-category.enum';

@Entity({ name: 'expenses' })
@Index(['expenseDate'])
@Index(['category'])
@Index(['userId'])
@Index(['expenseDate', 'category']) // Composite for filtered date range queries
@Index(['createdAt']) // For sorting by creation date
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string; // e.g., "Coffee for customers", "Office supplies"

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    nullable: true,
  })
  category?: ExpenseCategory; // Optional category

  @Column({ type: 'date' })
  expenseDate: Date; // When the expense occurred

  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional details

  @Column()
  userId: number; // Who recorded the expense

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
