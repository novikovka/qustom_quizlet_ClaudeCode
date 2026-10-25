import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClass, iconButtonClass, spinnerClass, type ButtonLook } from './buttonClass';

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonLook & {
    // Во время запроса кнопка неактивна и показывает индикатор
    loading?: boolean;
  };

// Кнопки из DESIGN.md, раздел 4: основная, второстепенная, контурная, тёмная, опасная
export function Button({
  variant,
  size,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[buttonClass({ variant, size, fullWidth }), className].filter(Boolean).join(' ')}
    >
      {loading && <span className={spinnerClass} aria-hidden="true" />}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // Подпись для экранных дикторов обязательна: у кнопки нет текста
  'aria-label': string;
  danger?: boolean;
  children: ReactNode;
};

export function IconButton({ danger, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[iconButtonClass(danger), className].filter(Boolean).join(' ')}
    />
  );
}
