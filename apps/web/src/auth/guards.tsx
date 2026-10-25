import { Navigate, Outlet } from 'react-router';
import { useAuth } from './useAuth';

// Страницы только для вошедших: остальных отправляем на вход
export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Вход и регистрация: вошедшего пользователя сразу отправляем к колодам
export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
