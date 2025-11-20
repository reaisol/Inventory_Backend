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
import { MetalPurity } from './metal-purity.entity';

@Entity({ name: 'metal_prices' })
@Index(['metalPurityId', 'effectiveDate'])
@Index(['isActive', 'effectiveDate'])
export class MetalPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  metalPurityId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerGram: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => MetalPurity, (metalPurity) => metalPurity.prices)
  @JoinColumn({ name: 'metalPurityId' })
  metalPurity: MetalPurity;
}
