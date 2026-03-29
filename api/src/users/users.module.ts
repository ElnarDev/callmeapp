import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registra la entidad User en este módulo
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Lo exportamos por si otros módulos lo necesitan en el futuro
})
export class UsersModule {}
