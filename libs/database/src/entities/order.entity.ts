import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';
import { Exchange } from './exchange.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

@Entity({ name: 'orders' })
@Index(['orderNumber'], { unique: true })
@Index(['orderDate'])
@Index(['status'])
@Index(['customerId'])
@Index(['userId'])
@Index(['orderDate', 'status']) // Composite for date range queries with status filter
@Index(['createdAt']) // For sorting by creation date
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string; // ORD-2025-0001

  @Column({ nullable: true })
  customerId: number; // nullable for walk-in customers

  @Column()
  userId: number; // who created the order

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  exchangeCredit: number; // from old gold/silver exchange

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  wastageAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  makingChargesAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Exchange, (exchange) => exchange.order)
  exchanges: Exchange[];
}
