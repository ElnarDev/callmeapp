import { AfterViewInit, ApplicationRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
    templateUrl: './forgot-password.component.html',
    providers: [MessageService],
})
export class ForgotPasswordComponent implements AfterViewInit {
    username = '';
    newPassword = '';
    confirmPassword = '';
    submitted = false;
    loading = false;

    constructor(
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router,
        private appRef: ApplicationRef,
    ) {}

    ngAfterViewInit() {
        Promise.resolve().then(() => this.appRef.tick());
    }

    submit() {
        this.submitted = true;
        if (!this.username || !this.newPassword || !this.confirmPassword) return;
        if (this.newPassword !== this.confirmPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Passwords do not match.' });
            return;
        }
        if (this.newPassword.length < 6) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Password must be at least 6 characters.' });
            return;
        }

        this.loading = true;
        this.authService.resetPassword({ username: this.username, newPassword: this.newPassword }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Done', detail: 'Password updated. You can now sign in.' });
                setTimeout(() => void this.router.navigate(['/auth/login']), 1500);
            },
            error: (err) => {
                this.loading = false;
                const msg = err.status === 404 ? 'Username not found.' : (err.error?.message ?? 'Something went wrong.');
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            },
        });
    }
}
