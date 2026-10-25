import { createContext } from 'react';

// success — белый с зелёной иконкой, info — тёмный (удаление), error — красный с «Повторить»
export type ToastKind = 'success' | 'info' | 'error';

export type ToastOptions = {
  kind: ToastKind;
  message: string;
  action?: { label: string; onClick: () => void };
};

export type ShowToast = (toast: ToastOptions) => void;

export const ToastContext = createContext<ShowToast | null>(null);
