import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // Nombre de la tabla en PostgreSQL
export class User {
  @PrimaryGeneratedColumn('uuid') // ID autogenerado tipo UUID
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' }) // El campo en BD se llama password_hash
  passwordHash!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl!: string;

  @Column({ name: 'is_online', default: false })
  isOnline!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
