import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';

export default [
    { path: 'users', component: UsersComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
