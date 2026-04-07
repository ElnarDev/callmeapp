import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginRequest } from './interfaces/login-request.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

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
}
