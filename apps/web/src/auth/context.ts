import { createContext } from 'react';
import type { User } from '../api/auth';

export type AuthState = {
  user: User | null;
  // true, пока не узнали у сервера, вошёл ли пользователь
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
