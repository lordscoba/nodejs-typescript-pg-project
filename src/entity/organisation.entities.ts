import { IsString } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entities';

@Entity()
export class Organisation extends BaseEntity {
  @PrimaryGeneratedColumn()
  orgId?: number;

  @Column()
  @IsString()
  name?: string;

  @Column()
  // @IsString()
  description?: string;

  // Automatically sets the timestamp when the entity is created
  @CreateDateColumn()
  createdAt?: Date;

  // Automatically updates the timestamp when the entity is updated
  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToMany(() => User)
  @JoinTable()
  User?: User[];
}
