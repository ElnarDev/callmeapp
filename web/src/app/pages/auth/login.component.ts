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
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
    templateUrl: './login.component.html',
    providers: [MessageService],
})
export class LoginComponent implements AfterViewInit {
    identifier = '';
    password = '';
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
        if (!this.identifier || !this.password) return;

        this.loading = true;
        this.authService.login({ identifier: this.identifier, password: this.password }).subscribe({
            next: () => {
                void this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading = false;
                const msg = err.error?.message ?? 'Invalid credentials';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            },
        });
    }
}
