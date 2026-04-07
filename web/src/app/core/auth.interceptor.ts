import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../pages/auth/auth.service';

// Interceptor funcional (Angular 17+): adjunta el Bearer token a cada petición saliente
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getAccessToken();

    if (token) {
        const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(authReq);
    }

    return next(req);
};
