import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type Props = {
  onClose: () => void;
  // id заголовка окна — по нему экранный диктор называет окно
  labelledBy: string;
  describedBy?: string;
  // alertdialog — для подтверждения опасных действий (удаление)
  role?: 'dialog' | 'alertdialog';
  className?: string;
  children: ReactNode;
};

const FOCUSABLE = 'input, button, a[href], textarea, select, [tabindex]:not([tabindex="-1"])';

// Модальное окно: затемнение, закрытие по Esc и клику мимо окна,
// фокус переходит в окно и не уходит из него по Tab, после закрытия возвращается назад
export function Modal({
  onClose,
  labelledBy,
  describedBy,
  role = 'dialog',
  className,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Куда вернуть фокус после закрытия. Запоминаем при первой отрисовке —
  // до того, как autoFocus переведёт фокус в поле окна
  const [returnFocusTo] = useState(() => document.activeElement as HTMLElement | null);
  // Свежий onClose без перезапуска эффекта: иначе фокус прыгал бы при каждой перерисовке
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => !el.hasAttribute('disabled'),
      );

    // Поле с autoFocus фокусируется само; иначе — первый элемент окна
    if (!dialog?.contains(document.activeElement)) {
      (focusables()[0] ?? dialog)?.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      returnFocusTo?.focus();
    };
  }, [returnFocusTo]);

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={[styles.dialog, className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
