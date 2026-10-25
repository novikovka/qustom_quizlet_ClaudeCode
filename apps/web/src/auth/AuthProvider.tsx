import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type User } from '../api/auth';
import { AuthContext, type AuthState } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // При открытии страницы спрашиваем сервер, есть ли сессия, —
  // так вход сохраняется после перезагрузки
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: async (email, password) => setUser(await authApi.login(email, password)),
      register: async (email, password) => setUser(await authApi.register(email, password)),
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
