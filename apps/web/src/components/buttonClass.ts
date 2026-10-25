import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'dark' | 'danger';

export type ButtonLook = {
  variant?: ButtonVariant;
  size?: 'normal' | 'small';
  fullWidth?: boolean;
};

// Классы кнопки — общие для <button> и ссылок, которые выглядят как кнопки
export function buttonClass({ variant = 'primary', size = 'normal', fullWidth }: ButtonLook = {}) {
  return [
    styles.button,
    styles[variant],
    size === 'small' && styles.small,
    fullWidth && styles.full,
  ]
    .filter(Boolean)
    .join(' ');
}

export const iconButtonClass = (danger?: boolean) =>
  [styles.icon, danger && styles.iconDanger].filter(Boolean).join(' ');

export const spinnerClass = styles.spinner;
