import { api } from './client';

export type User = { id: number; email: string };

type UserResponse = { user: User };

export const authApi = {
  me: () => api<UserResponse>('/auth/me').then((r) => r.user),

  login: (email: string, password: string) =>
    api<UserResponse>('/auth/login', { method: 'POST', body: { email, password } }).then(
      (r) => r.user,
    ),

  register: (email: string, password: string) =>
    api<UserResponse>('/auth/register', { method: 'POST', body: { email, password } }).then(
      (r) => r.user,
    ),

  logout: () => api<void>('/auth/logout', { method: 'POST' }),
};
