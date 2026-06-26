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
import { MetalType } from './metal-type.entity';
import { MetalPurity } from './metal-purity.entity';
import { Category } from './category.entity';
import { ProductStock } from './product-stock.entity';
import { OrderItem } from './order-item.entity';
import { ProductStatus } from './enums/product-status.enum';

@Entity({ name: 'products' })
@Index(['productId'], { unique: true })
@Index(['barcode'], { unique: true, where: 'barcode IS NOT NULL' })
@Index(['status'])
@Index(['metalTypeId', 'categoryId'])
@Index(['metalPurityId']) // FK index for joins
@Index(['name']) // For search queries
@Index(['status', 'createdAt']) // Composite for common filtered + sorted queries
@Index(['createdAt']) // For sorting by creation date
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  productId: string; // New format: GL-26-01 / SL-26-01

  @Column()
  name: string;

  @Column()
  metalTypeId: number;

  @Column()
  metalPurityId: number;

  @Column()
  categoryId: number;

  @Column('decimal', { precision: 10, scale: 3 })
  grossWeightGm: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  grossWeightCt: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  stoneWeightGm: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  stoneWeightCt: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, default: 0 })
  stoneCost: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0.0 })
  wastagePercentage: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0.0 })
  makingChargesPercentage: number;

  @Column({ nullable: true, unique: true })
  barcode: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK,
  })
  status: ProductStatus;

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @Column({ default: false })
  isBulkItem: boolean; // Flag to identify bulk items (e.g., 100 toe rings in one cover)

  @Column({ nullable: true })
  totalQuantity?: number; // Total items in bulk (e.g., 100)

  @Column({ nullable: true })
  remainingQuantity?: number; // Remaining items after sales (e.g., 90)

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  weightPerItem?: number; // Calculated: grossWeightGm / totalQuantity

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => MetalType)
  @JoinColumn({ name: 'metalTypeId' })
  metalType: MetalType;

  @ManyToOne(() => MetalPurity, (metalPurity) => metalPurity.products)
  @JoinColumn({ name: 'metalPurityId' })
  metalPurity: MetalPurity;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductStock, (productStock) => productStock.product)
  stockHistory: ProductStock[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
