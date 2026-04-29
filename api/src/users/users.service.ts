import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const exists = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (exists) {
      throw new ConflictException('El email o username ya está en uso');
    }

    // Hasheamos la contraseña con SHA-256 (en producción usaremos bcrypt)
    const passwordHash = crypto
      .createHash('sha256')
      .update(createUserDto.password)
      .digest('hex');

    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash,
      avatarUrl: createUserDto.avatarUrl,
    });

    const saved = await this.usersRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    await this.findOne(id); // Lanza 404 si no existe

    const updates: Partial<User> = {};
    if (updateUserDto.username) updates.username = updateUserDto.username;
    if (updateUserDto.email) updates.email = updateUserDto.email;
    if (updateUserDto.avatarUrl) updates.avatarUrl = updateUserDto.avatarUrl;
    if (updateUserDto.password) {
      updates.passwordHash = crypto
        .createHash('sha256')
        .update(updateUserDto.password)
        .digest('hex');
    }

    await this.usersRepository.update(id, updates);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Lanza 404 si no existe
    await this.usersRepository.delete(id);
  }

  // Uso interno del módulo Auth — retorna la entidad completa incluyendo passwordHash
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Uso interno del módulo Auth — busca por username
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // Uso interno — retorna entidad completa para obtener email en refresh de tokens
  async findOneEntity(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return user;
  }

  // Uso interno del módulo Auth — actualiza el hash directamente sin exponer la contraseña
  async updatePasswordHash(id: string, newHash: string): Promise<void> {
    await this.usersRepository.update(id, { passwordHash: newHash });
  }
}
