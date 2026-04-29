import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { LoginComponent } from './app/pages/auth/login.component';
import { RegisterComponent } from './app/pages/auth/register.component';
import { ForgotPasswordComponent } from './app/pages/auth/forgot-password.component';
import { authGuard } from './app/core/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'auth/forgot-password', component: ForgotPasswordComponent },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
