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
import { User, UserService, CreateUserDto } from './user.service';

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
    template: `
        <p-toast />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New User" icon="pi pi-plus" severity="secondary" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="users()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['username', 'email']"
            [tableStyle]="{ 'min-width': '60rem' }"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
            [showCurrentPageReport]="true"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Manage Users</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th pSortableColumn="username" style="min-width: 14rem">
                        Username <p-sortIcon field="username" />
                    </th>
                    <th pSortableColumn="email" style="min-width: 18rem">
                        Email <p-sortIcon field="email" />
                    </th>
                    <th pSortableColumn="isOnline" style="min-width: 8rem">
                        Status <p-sortIcon field="isOnline" />
                    </th>
                    <th pSortableColumn="createdAt" style="min-width: 12rem">
                        Created At <p-sortIcon field="createdAt" />
                    </th>
                    <th style="min-width: 10rem"></th>
                </tr>
            </ng-template>

            <ng-template #body let-user>
                <tr>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                        <p-tag [value]="user.isOnline ? 'Online' : 'Offline'" [severity]="user.isOnline ? 'success' : 'secondary'" />
                    </td>
                    <td>{{ user.createdAt | date: 'short' }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editUser(user)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="confirmDelete(user)" />
                    </td>
                </tr>
            </ng-template>

            <ng-template #emptymessage>
                <tr>
                    <td colspan="5" class="text-center p-6">No users found.</td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Create / Edit Dialog -->
        <p-dialog [(visible)]="userDialog" [style]="{ width: '420px' }" header="User Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-5">
                    <div>
                        <label for="username" class="block font-bold mb-2">Username</label>
                        <input
                            id="username"
                            type="text"
                            pInputText
                            [(ngModel)]="form.username"
                            placeholder="e.g. john_doe"
                            fluid
                            autofocus
                        />
                        <small class="text-red-500" *ngIf="submitted && !form.username">Username is required.</small>
                    </div>
                    <div>
                        <label for="email" class="block font-bold mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            pInputText
                            [(ngModel)]="form.email"
                            placeholder="e.g. john@example.com"
                            fluid
                        />
                        <small class="text-red-500" *ngIf="submitted && !form.email">Email is required.</small>
                    </div>
                    <div>
                        <label for="password" class="block font-bold mb-2">
                            Password <span *ngIf="editingId" class="font-normal text-sm text-surface-400">(leave blank to keep current)</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            pInputText
                            [(ngModel)]="form.password"
                            placeholder="••••••••"
                            fluid
                        />
                        <small class="text-red-500" *ngIf="submitted && !editingId && !form.password">Password is required.</small>
                    </div>
                    <div>
                        <label for="avatarUrl" class="block font-bold mb-2">Avatar URL <span class="font-normal text-sm text-surface-400">(optional)</span></label>
                        <input
                            id="avatarUrl"
                            type="text"
                            pInputText
                            [(ngModel)]="form.avatarUrl"
                            placeholder="https://..."
                            fluid
                        />
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveUser()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class Users implements OnInit {
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
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAll().subscribe({
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
            this.userService.create(payload).subscribe({
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
            this.userService.update(this.editingId!, payload).subscribe({
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
                this.userService.delete(user.id).subscribe({
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
