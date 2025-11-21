import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'roles' })
@Index(['name'], { unique: true }) // Explicit unique index for name
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g. "site_supervisor", "inventory_manager"

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  // permission simple array
  @Column({ type: 'simple-array' })
  permissions: string[];
}
