import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CallSession } from './call-session.entity';

@Entity('call_participants')
export class CallParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id' })
  sessionId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;

  @Column({ name: 'left_at', type: 'timestamptz', nullable: true })
  leftAt!: Date | null;

  @ManyToOne(() => CallSession, (s) => s.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: CallSession;
}
