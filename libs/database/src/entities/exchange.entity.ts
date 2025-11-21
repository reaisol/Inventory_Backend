import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { MetalPurity } from './metal-purity.entity';
import { ExchangeType } from './enums/exchange-type.enum';

@Entity({ name: 'exchanges' })
@Index(['orderId'])
@Index(['metalPurityId'])
@Index(['orderId', 'metalPurityId']) // Composite for order-exchange lookups
@Index(['exchangeType']) // For filtering by exchange type
export class Exchange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number; // always tied to an order (required)

  @Column({
    type: 'enum',
    enum: ExchangeType,
  })
  exchangeType: ExchangeType; // GOLD, SILVER

  @Column()
  metalPurityId: number;

  @Column('decimal', { precision: 10, scale: 3 })
  weightGm: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerGram: number; // at time of exchange

  @Column('decimal', { precision: 10, scale: 2 })
  totalCredit: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.exchanges)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => MetalPurity, (metalPurity) => metalPurity.exchanges)
  @JoinColumn({ name: 'metalPurityId' })
  metalPurity: MetalPurity;
}
