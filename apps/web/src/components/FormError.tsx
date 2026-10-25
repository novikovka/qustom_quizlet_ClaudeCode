import { ErrorIcon } from './ErrorIcon';
import styles from './FormError.module.css';

// Ошибка от сервера над кнопкой формы
export function FormError({ message }: { message: string }) {
  return (
    <div className={styles.box} role="alert">
      <ErrorIcon />
      <span>{message}</span>
    </div>
  );
}
