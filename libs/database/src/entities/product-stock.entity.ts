import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { StockType } from './enums/stock-type.enum';

@Entity({ name: 'product_stocks' })
@Index(['productId', 'createdAt'])
@Index(['referenceType', 'referenceId'])
export class ProductStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column({
    type: 'enum',
    enum: StockType,
  })
  stockType: StockType; // IN, OUT, ADJUSTMENT

  @Column()
  referenceType: string; // SALE, PURCHASE, RETURN, ADJUSTMENT

  @Column({ nullable: true })
  referenceId: number; // FK to related entity (Order, etc.)

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.stockHistory)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
