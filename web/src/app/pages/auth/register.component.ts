import { AfterViewInit, ApplicationRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { UsersService } from '../users/users.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
    templateUrl: './register.component.html',
    providers: [MessageService],
})
export class RegisterComponent implements AfterViewInit {
    username = '';
    email = '';
    password = '';
    confirmPassword = '';
    submitted = false;
    loading = false;

    constructor(
        private usersService: UsersService,
        private messageService: MessageService,
        private router: Router,
        private appRef: ApplicationRef,
    ) {}

    ngAfterViewInit() {
        Promise.resolve().then(() => this.appRef.tick());
    }

    submit() {
        this.submitted = true;
        if (!this.username || !this.email || !this.password || !this.confirmPassword) return;
        if (this.password !== this.confirmPassword) return;

        this.loading = true;
        this.usersService.create({ username: this.username, email: this.email, password: this.password }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Account created', detail: 'You can now sign in.' });
                setTimeout(() => void this.router.navigate(['/auth/login']), 1500);
            },
            error: (err) => {
                this.loading = false;
                const msg = err.error?.message ?? 'Could not create account';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            },
        });
    }
}
