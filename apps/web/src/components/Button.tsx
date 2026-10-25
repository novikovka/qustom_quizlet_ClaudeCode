import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  // Во время запроса кнопка неактивна и показывает индикатор
  loading?: boolean;
  fullWidth?: boolean;
};

// Основная кнопка (DESIGN.md, раздел 4). Остальные варианты добавим, когда понадобятся
export function Button({ loading, fullWidth, disabled, className, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[styles.button, fullWidth && styles.full, className].filter(Boolean).join(' ')}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
