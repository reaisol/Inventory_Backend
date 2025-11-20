import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'system_settings' })
@Index(['key'], { unique: true })
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // LOW_STOCK_THRESHOLD, DEFAULT_WASTAGE_PERCENTAGE, etc.

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
