export type UserStatus = 'available' | 'busy' | 'away' | 'offline';

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}
