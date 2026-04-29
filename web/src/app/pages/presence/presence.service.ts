import { Injectable, inject, OnDestroy } from '@angular/core';
import { signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { UserStatus } from '../users/interfaces/user.interface';

export interface PresenceEntry {
    userId: string;
    username: string;
    status: UserStatus;
}

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
    private readonly authService = inject(AuthService);

    private socket: Socket | null = null;

    // Mapa reactivo: userId → status — accesible desde cualquier componente
    readonly presenceMap = signal<Map<string, PresenceEntry>>(new Map());

    connect(): void {
        if (this.socket?.connected) return;

        const token = this.authService.getAccessToken();
        if (!token) return;

        this.socket = io('http://localhost:3800/presence', {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('[Presence] Conectado al servidor. Socket ID:', this.socket?.id);
            // Restaurar preferencia de estado de la sesión anterior
            const saved = localStorage.getItem('userStatus') as UserStatus | null;
            if (saved && saved !== 'offline') {
                console.log(`[Presence] Restaurando estado guardado: ${saved}`);
                this.socket!.emit('status:set', { status: saved });
            }
        });

        this.socket.on('connect_error', (err) => {
            console.error('[Presence] Error de conexión:', err.message);
        });

        this.socket.on('presence:snapshot', (entries: PresenceEntry[]) => {
            console.log('[Presence] Snapshot recibido — usuarios online:', entries.length, entries);
            const map = new Map<string, PresenceEntry>();
            entries.forEach(e => map.set(e.userId, e));
            this.presenceMap.set(map);
        });

        this.socket.on('presence:update', (entry: PresenceEntry) => {
            console.log(`[Presence] Update recibido — ${entry.username}: ${entry.status}`);
            this.presenceMap.update(map => {
                const next = new Map(map);
                if (entry.status === 'offline') {
                    next.delete(entry.userId);
                } else {
                    next.set(entry.userId, entry);
                }
                return next;
            });
        });
    }

    setStatus(status: UserStatus): void {
        if (!this.socket?.connected) {
            console.warn('[Presence] setStatus llamado pero el socket no está conectado');
            return;
        }
        console.log(`[Presence] Emitiendo status:set → ${status}`);
        this.socket.emit('status:set', { status });
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
    }

    getStatus(userId: string): UserStatus {
        return this.presenceMap().get(userId)?.status ?? 'offline';
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
