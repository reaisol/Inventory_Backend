import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'customers' })
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}
