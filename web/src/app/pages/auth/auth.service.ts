import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginRequest } from './interfaces/login-request.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { ResetPasswordRequest } from './interfaces/reset-password.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly baseUrl = 'http://localhost:3800/auth';

    login(dto: LoginRequest) {
        return this.http.post<AuthResponse>(`${this.baseUrl}/login`, dto).pipe(
            tap((res) => {
                localStorage.setItem('accessToken', res.accessToken);
                localStorage.setItem('refreshToken', res.refreshToken);
            }),
        );
    }

    logout() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            this.http.post(`${this.baseUrl}/logout`, { refreshToken }).subscribe();
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        void this.router.navigate(['/auth/login']);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getCurrentUser(): { id: string; email: string; username: string } | null {
        const token = this.getAccessToken();
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
            return { id: decoded.sub, email: decoded.email, username: decoded.username };
        } catch {
            return null;
        }
    }

    resetPassword(dto: ResetPasswordRequest) {
        return this.http.post(`${this.baseUrl}/reset-password`, dto);
    }
}
