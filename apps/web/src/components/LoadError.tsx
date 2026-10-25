import { ApiError } from '../api/client';
import { Button } from './Button';
import { PlugIcon } from './icons';
import styles from './LoadError.module.css';

// Не удалось загрузить данные: понятное сообщение и кнопка «Повторить»
export function LoadError({
  error,
  what,
  onRetry,
}: {
  error: unknown;
  what: string;
  onRetry: () => void;
}) {
  const offline = !(error instanceof ApiError) || error.status === 0 || error.status >= 500;

  return (
    <div className={styles.box} role="alert">
      <span className={styles.icon} aria-hidden="true">
        <PlugIcon size={30} />
      </span>
      <h2 className={styles.title}>{offline ? 'Нет связи с сервером' : 'Не удалось загрузить'}</h2>
      <p className={styles.text}>
        {offline
          ? `${what} не загрузились. Проверьте, что сервер запущен, и попробуйте ещё раз.`
          : (error as ApiError).message}
      </p>
      <Button onClick={onRetry}>Повторить</Button>
    </div>
  );
}
