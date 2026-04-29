import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/jwt.strategy';

export type UserStatus = 'available' | 'busy' | 'away' | 'offline';

interface PresenceEntry {
  socketId: string;
  userId: string;
  username: string;
  status: UserStatus;
}

@WebSocketGateway({
  cors: { origin: 'http://localhost:4444', credentials: true },
  namespace: '/presence',
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Mapa en memoria: userId → PresenceEntry
  private readonly presence = new Map<string, PresenceEntry>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    const token =
      (socket.handshake.auth['token'] as string) ??
      (socket.handshake.headers['authorization'] as string)?.replace('Bearer ', '');

    if (!token) {
      console.warn('[Presence] Conexión rechazada — sin token. Socket:', socket.id);
      socket.disconnect();
      return;
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      console.warn('[Presence] Conexión rechazada — token inválido. Socket:', socket.id);
      socket.disconnect();
      return;
    }

    socket.data['userId'] = payload.sub;
    socket.data['username'] = payload.username;

    this.presence.set(payload.sub, {
      socketId: socket.id,
      userId: payload.sub,
      username: payload.username,
      status: 'available',
    });

    console.log(`[Presence] ✅ ${payload.username} conectado (${socket.id}). Online: ${this.presence.size}`);

    this.server.emit('presence:update', {
      userId: payload.sub,
      username: payload.username,
      status: 'available',
    });

    socket.emit('presence:snapshot', Array.from(this.presence.values()));
  }

  handleDisconnect(socket: Socket): void {
    const userId = socket.data['userId'] as string | undefined;
    if (!userId) return;

    const entry = this.presence.get(userId);
    if (!entry) return;

    this.presence.delete(userId);
    console.log(`[Presence] 🔴 ${entry.username} desconectado. Online: ${this.presence.size}`);

    this.server.emit('presence:update', {
      userId,
      username: entry.username,
      status: 'offline',
    });
  }

  @SubscribeMessage('status:set')
  handleStatusSet(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { status: UserStatus },
  ): void {
    const userId = socket.data['userId'] as string | undefined;
    if (!userId) return;

    const entry = this.presence.get(userId);
    if (!entry) return;

    entry.status = data.status;
    console.log(`[Presence] 🔄 ${entry.username} cambió estado → ${data.status}. Propagando a ${this.server.sockets.sockets.size} clientes.`);

    this.server.emit('presence:update', {
      userId,
      username: entry.username,
      status: data.status,
    });
  }

  // Método público para que otros servicios consulten presencia
  getPresenceSnapshot(): PresenceEntry[] {
    return Array.from(this.presence.values());
  }
}
