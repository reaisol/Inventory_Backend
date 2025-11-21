import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { MetalPurity } from './metal-purity.entity';

@Entity({ name: 'metal_types' })
@Index(['code'], { unique: true }) // Explicit unique index for code
@Index(['name']) // For search queries
export class MetalType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Gold, Silver

  @Column({ unique: true })
  code: string; // GOLD, SILVER

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MetalPurity, (metalPurity) => metalPurity.metalType)
  purities: MetalPurity[];
}
