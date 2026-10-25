import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckIcon, TrashIcon } from '../components/icons';
import { ErrorIcon } from '../components/ErrorIcon';
import { ToastContext, type ToastOptions } from './context';
import styles from './Toast.module.css';

const LIFETIME_MS = 4000;

type Toast = ToastOptions & { id: number };

// Всплывающие сообщения справа снизу; каждое исчезает через 4 секунды
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (toast: ToastOptions) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { ...toast, id }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), LIFETIME_MS),
      );
    },
    [dismiss],
  );

  // Таймеры не должны сработать после ухода со страницы
  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.container} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.kind]}`}>
            <span className={styles.icon} aria-hidden="true">
              {t.kind === 'success' && <CheckIcon size={18} />}
              {t.kind === 'info' && <TrashIcon size={18} />}
              {t.kind === 'error' && <ErrorIcon />}
            </span>
            <span className={styles.message}>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  dismiss(t.id);
                  t.action?.onClick();
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
