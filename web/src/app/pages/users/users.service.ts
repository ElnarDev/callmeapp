import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './interfaces/create-user.interface';
import { UpdateUserDto } from './interfaces/update-user.interface';

@Injectable({ providedIn: 'root' })
export class UsersService {
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
