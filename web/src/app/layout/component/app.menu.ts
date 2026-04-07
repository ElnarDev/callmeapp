import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/app/pages/auth/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
        <li class="mt-4 px-4">
            <button
                class="w-full flex items-center gap-2 p-2 rounded text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                (click)="logout()"
            >
                <i class="pi pi-sign-out"></i>
                <span>Sign Out</span>
            </button>
        </li>
    </ul>`,
})
export class AppMenu {
    model: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                    { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/pages/users'] }
                ]
            }
        ];
    }

    logout() {
        this.authService.logout();
    }
}
