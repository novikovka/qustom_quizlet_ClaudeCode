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
      {offline ? (
        <UnpluggedArt />
      ) : (
        <span className={styles.icon} aria-hidden="true">
          <PlugIcon size={30} />
        </span>
      )}
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

// Разъединённая вилка и розетка, между ними мигает искра (DESIGN.md, экран 10)
function UnpluggedArt() {
  return (
    <svg className={styles.art} viewBox="0 0 220 90" aria-hidden="true">
      {/* провод и вилка слева */}
      <path className={styles.wire} d="M4 45h44" />
      <rect className={styles.plug} x="48" y="27" width="36" height="36" rx="9" />
      <path className={styles.prong} d="M84 37h14M84 53h14" />
      {/* розетка и провод справа */}
      <rect className={styles.socket} x="136" y="27" width="36" height="36" rx="9" />
      <path className={styles.socketHole} d="M136 37h-8M136 53h-8" />
      <path className={styles.wire} d="M172 45h44" />
      {/* искра */}
      <path className={styles.spark} d="M117 22l-6 18h9l-7 20 15-24h-9l6-14z" />
    </svg>
  );
}
