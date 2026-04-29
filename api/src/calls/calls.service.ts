import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallSession, CallStatus } from './entities/call-session.entity';
import { CallParticipant } from './entities/call-participant.entity';
import { CreateCallSessionDto } from './dto/create-call-session.dto';
import { UpdateCallSessionDto } from './dto/update-call-session.dto';

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(CallSession)
    private readonly sessionRepo: Repository<CallSession>,
    @InjectRepository(CallParticipant)
    private readonly participantRepo: Repository<CallParticipant>,
  ) {}

  async create(hostId: string, dto: CreateCallSessionDto): Promise<CallSession> {
    const roomCode = this.generateRoomCode();
    const session = this.sessionRepo.create({
      roomCode,
      hostId,
      maxParticipants: dto.maxParticipants ?? 2,
    });
    return this.sessionRepo.save(session);
  }

  async findAll(): Promise<CallSession[]> {
    return this.sessionRepo.find({
      relations: ['participants'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CallSession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!session) throw new NotFoundException(`Call session ${id} not found`);
    return session;
  }

  async updateStatus(id: string, dto: UpdateCallSessionDto): Promise<CallSession> {
    const session = await this.findOne(id);
    this.validateTransition(session.status, dto.status);

    session.status = dto.status;

    if (dto.status === CallStatus.ACTIVE && !session.startedAt) {
      session.startedAt = new Date();
    }

    if (dto.status === CallStatus.ENDED && !session.endedAt) {
      session.endedAt = new Date();
      if (session.startedAt) {
        session.durationSeconds = Math.floor(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
        );
      }
      // Registrar salida de todos los participantes activos
      await this.participantRepo
        .createQueryBuilder()
        .update()
        .set({ leftAt: session.endedAt })
        .where('session_id = :id AND left_at IS NULL', { id })
        .execute();
    }

    return this.sessionRepo.save(session);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.sessionRepo.delete(id);
  }

  async join(sessionId: string, userId: string): Promise<CallParticipant> {
    const session = await this.findOne(sessionId);

    if (session.status === CallStatus.ENDED) {
      throw new BadRequestException('Cannot join an ended call');
    }

    // Verificar si ya está en la sala (sin haber salido)
    const existing = await this.participantRepo.findOne({
      where: { sessionId, userId, leftAt: null as any },
    });
    if (existing) throw new ConflictException('User is already in this call');

    // Verificar límite de participantes activos
    const activeCount = await this.participantRepo.count({
      where: { sessionId, leftAt: null as any },
    });
    if (activeCount >= session.maxParticipants) {
      throw new BadRequestException('Call is at maximum capacity');
    }

    const participant = this.participantRepo.create({ sessionId, userId });
    return this.participantRepo.save(participant);
  }

  async leave(sessionId: string, userId: string): Promise<void> {
    await this.findOne(sessionId);

    const participant = await this.participantRepo.findOne({
      where: { sessionId, userId, leftAt: null as any },
    });
    if (!participant) throw new NotFoundException('User is not in this call');

    participant.leftAt = new Date();
    await this.participantRepo.save(participant);
  }

  // Genera un código de sala de 8 caracteres alfanuméricos en mayúsculas
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }

  // Solo permite transiciones válidas: waiting→active, active→ended
  private validateTransition(current: CallStatus, next: CallStatus): void {
    const allowed: Record<CallStatus, CallStatus[]> = {
      [CallStatus.WAITING]: [CallStatus.ACTIVE],
      [CallStatus.ACTIVE]: [CallStatus.ENDED],
      [CallStatus.ENDED]: [],
    };
    if (!allowed[current].includes(next)) {
      throw new BadRequestException(
        `Cannot transition from '${current}' to '${next}'`,
      );
    }
  }
}
