import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto) {
    // Detecta si el identifier tiene formato de email o es un username
    const isEmail = dto.identifier.includes('@');
    const user = isEmail
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByUsername(dto.identifier);

    const hash = crypto.createHash('sha256').update(dto.password).digest('hex');

    if (!user || user.passwordHash !== hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(rawToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash, isRevoked: false },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Rotacion: el token usado se revoca y se emite uno nuevo
    stored.isRevoked = true;
    await this.refreshTokenRepo.save(stored);

    const user = await this.usersService.findOneEntity(stored.userId);
    return this.generateTokens(user.id, user.email);
  }

  async logout(rawToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    await this.refreshTokenRepo.update({ tokenHash }, { isRevoked: true });
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    // Token opaco aleatorio — no un JWT
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        Number(this.config.get<number>('JWT_REFRESH_EXPIRATION_DAYS') ?? 7),
    );

    const entity = this.refreshTokenRepo.create({
      tokenHash: refreshTokenHash,
      userId,
      expiresAt,
    });
    await this.refreshTokenRepo.save(entity);

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
