import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MetalType } from './metal-type.entity';
import { MetalPrice } from './metal-price.entity';
import { Product } from './product.entity';
import { Exchange } from './exchange.entity';

@Entity({ name: 'metal_purities' })
export class MetalPurity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  metalTypeId: number;

  @Column()
  name: string; // 24K, 22K, 18K, Fine, Sterling

  @Column()
  code: string; // 24K, 22K, 18K, FINE, STERLING

  @Column('decimal', { precision: 5, scale: 2 })
  purityPercentage: number; // e.g., 99.9 for 24K, 91.6 for 22K

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => MetalType, (metalType) => metalType.purities)
  @JoinColumn({ name: 'metalTypeId' })
  metalType: MetalType;

  @OneToMany(() => MetalPrice, (metalPrice) => metalPrice.metalPurity)
  prices: MetalPrice[];

  @OneToMany(() => Product, (product) => product.metalPurity)
  products: Product[];

  @OneToMany(() => Exchange, (exchange) => exchange.metalPurity)
  exchanges: Exchange[];
}
