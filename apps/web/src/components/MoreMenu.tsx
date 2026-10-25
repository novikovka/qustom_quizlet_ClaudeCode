import { useEffect, useId, useRef, useState } from 'react';
import { IconButton } from './Button';
import { MoreIcon } from './icons';
import styles from './MoreMenu.module.css';

type Item = { label: string; onClick: () => void; danger?: boolean };

// Кнопка «⋯» с выпадающим меню действий — для телефонной раскладки
export function MoreMenu({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    // Фокус — на первый пункт, чтобы с клавиатуры сразу можно было выбрать
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <IconButton
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreIcon />
      </IconButton>
      {open && (
        <div className={styles.menu} id={menuId} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`${styles.item} ${item.danger ? styles.danger : ''}`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
