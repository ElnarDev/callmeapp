import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './interfaces/create-user.interface';
import { UsersService } from './users.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule
    ],
    templateUrl: './users.component.html',
    providers: [MessageService, ConfirmationService]
})
export class UsersComponent implements OnInit {
    users = signal<User[]>([]);
    userDialog = false;
    submitted = false;
    editingId: string | null = null;

    form: CreateUserDto & { avatarUrl?: string } = {
        username: '',
        email: '',
        password: '',
        avatarUrl: ''
    };

    @ViewChild('dt') dt!: Table;

    constructor(
        private usersService: UsersService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.usersService.getAll().subscribe({
            next: (data) => this.users.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load users' })
        });
    }

    openNew() {
        this.form = { username: '', email: '', password: '', avatarUrl: '' };
        this.editingId = null;
        this.submitted = false;
        this.userDialog = true;
    }

    editUser(user: User) {
        this.form = { username: user.username, email: user.email, password: '', avatarUrl: user.avatarUrl ?? '' };
        this.editingId = user.id;
        this.submitted = false;
        this.userDialog = true;
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    saveUser() {
        this.submitted = true;

        const isNew = !this.editingId;
        if (!this.form.username || !this.form.email) return;
        if (isNew && !this.form.password) return;

        const payload: any = {
            username: this.form.username,
            email: this.form.email,
            ...(this.form.avatarUrl ? { avatarUrl: this.form.avatarUrl } : {})
        };

        if (this.form.password) {
            payload['password'] = this.form.password;
        }

        if (isNew) {
            this.usersService.create(payload).subscribe({
                next: (created) => {
                    this.users.update((users) => [...users, created]);
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created' });
                    this.hideDialog();
                },
                error: (err) => {
                    const msg = err.error?.message ?? 'Could not create user';
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
                }
            });
        } else {
            this.usersService.update(this.editingId!, payload).subscribe({
                next: (updated) => {
                    this.users.update((users) => users.map((u) => (u.id === updated.id ? updated : u)));
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated' });
                    this.hideDialog();
                },
                error: (err) => {
                    const msg = err.error?.message ?? 'Could not update user';
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
                }
            });
        }
    }

    confirmDelete(user: User) {
        this.confirmationService.confirm({
            message: `Delete user "${user.username}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usersService.delete(user.id).subscribe({
                    next: () => {
                        this.users.update((users) => users.filter((u) => u.id !== user.id));
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete user' })
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
