import { Routes } from '@angular/router';
import { Users } from './users/users';

export default [
    { path: 'users', component: Users },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
