import { Outlet } from 'react-router';
import { Header } from './Header';

// Общая раскладка экранов после входа: шапка и содержимое страницы
export function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
