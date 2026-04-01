import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    isOnline: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
    avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3800/users';

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.baseUrl);
    }

    getById(id: string): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/${id}`);
    }

    create(dto: CreateUserDto): Observable<User> {
        return this.http.post<User>(this.baseUrl, dto);
    }

    update(id: string, dto: UpdateUserDto): Observable<User> {
        return this.http.patch<User>(`${this.baseUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
