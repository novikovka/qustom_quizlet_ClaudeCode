import { useContext } from 'react';
import { ToastContext } from './context';

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) {
    throw new Error('useToast вызван вне ToastProvider');
  }
  return show;
}
