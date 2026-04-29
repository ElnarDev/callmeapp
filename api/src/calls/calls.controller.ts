import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CallsService } from './calls.service';
import { CreateCallSessionDto } from './dto/create-call-session.dto';
import { UpdateCallSessionDto } from './dto/update-call-session.dto';

@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  // POST /calls — el host crea la sala
  @Post()
  create(@Request() req: any, @Body() dto: CreateCallSessionDto) {
    return this.callsService.create(req.user.userId, dto);
  }

  // GET /calls
  @Get()
  findAll() {
    return this.callsService.findAll();
  }

  // GET /calls/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.findOne(id);
  }

  // PATCH /calls/:id — cambiar estado (waiting→active, active→ended)
  @Patch(':id')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCallSessionDto,
  ) {
    return this.callsService.updateStatus(id, dto);
  }

  // DELETE /calls/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.remove(id);
  }

  // POST /calls/:id/join — unirse a la sala
  @Post(':id/join')
  join(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.callsService.join(id, req.user.userId);
  }

  // POST /calls/:id/leave — salir de la sala
  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leave(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.callsService.leave(id, req.user.userId);
  }
}
