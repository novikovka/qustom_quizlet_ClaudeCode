import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import styles from './UserMenu.module.css';

// Круг с первой буквой email; по клику — email и пункт «Выйти»
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Закрываем меню по клику мимо него и по Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Меню пользователя"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar}>{user.email[0].toUpperCase()}</span>
      </button>
      {open && (
        <div className={styles.menu} id={menuId}>
          <p className={styles.email}>{user.email}</p>
          <button type="button" className={styles.item} onClick={() => logout()}>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
