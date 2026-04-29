import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallSession } from './entities/call-session.entity';
import { CallParticipant } from './entities/call-participant.entity';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CallSession, CallParticipant])],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
