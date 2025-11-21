import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'categories' })
@Index(['code'], { unique: true }) // Explicit unique index for code
@Index(['name']) // For search queries
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Necklace, Bracelet, Earrings, Rings, Bangles

  @Column({ unique: true })
  code: string; // NECKLACE, BRACELET, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
