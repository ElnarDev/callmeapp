import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CallParticipant } from './call-participant.entity';

export enum CallStatus {
  WAITING = 'waiting',   // Sala creada, esperando participantes
  ACTIVE = 'active',     // Llamada en curso
  ENDED = 'ended',       // Llamada finalizada
}

@Entity('call_sessions')
export class CallSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'room_code', unique: true, length: 8 })
  roomCode!: string;

  @Column({ name: 'host_id' })
  hostId!: string;

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.WAITING })
  status!: CallStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt!: Date | null;

  // Duración en segundos — se calcula al cerrar la llamada
  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds!: number | null;

  @Column({ name: 'max_participants', default: 2 })
  maxParticipants!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => CallParticipant, (p) => p.session, { cascade: true })
  participants!: CallParticipant[];
}
