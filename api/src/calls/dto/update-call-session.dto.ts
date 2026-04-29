import { IsEnum } from 'class-validator';
import { CallStatus } from '../entities/call-session.entity';

export class UpdateCallSessionDto {
  @IsEnum(CallStatus)
  status!: CallStatus;
}
