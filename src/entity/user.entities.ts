import bcrypt from 'bcrypt';
import { IsEmail, IsOptional, Length } from 'class-validator';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId?: number;

  @Column()
  // @IsString()
  firstName?: string;

  @Column()
  // @IsString()
  lastName?: string;

  @Column()
  @IsEmail({}, { message: 'Invalid email format' })
  // @IsString()
  email?: string;

  @Column()
  @Length(4, 20, { message: 'Password must be between 4 and 20 characters' })
  password?: string;

  // This method is used to compare the entered password with the hashed password
  async matchPassword(enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password!);
  }

  // This method is used to hash the password before saving it to the database
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column()
  @IsOptional()
  phone?: string;

  // Automatically sets the timestamp when the entity is created
  @CreateDateColumn()
  createdAt?: Date;

  // Automatically updates the timestamp when the entity is updated
  @UpdateDateColumn()
  updatedAt?: Date;
}
