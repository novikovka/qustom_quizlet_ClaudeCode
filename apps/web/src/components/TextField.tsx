import { useEffect, useId, useRef, type InputHTMLAttributes, type Ref } from 'react';
import { ErrorIcon } from './ErrorIcon';
import styles from './TextField.module.css';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  // Меняется при каждой попытке отправки, чтобы поле с ошибкой тряслось снова
  shakeKey?: number;
  // Доступ к самому <input> снаружи, например чтобы вернуть в него фокус
  ref?: Ref<HTMLInputElement>;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function TextField({ label, error, hint, shakeKey, className, ref, ...inputProps }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Ссылка нужна и самому полю (для тряски), и тому, кто его использует
  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  useEffect(() => {
    if (!error || prefersReducedMotion()) return;
    inputRef.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 400, easing: 'ease-in-out' },
    );
  }, [error, shakeKey]);

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        {...inputProps}
        ref={setRefs}
        id={id}
        className={[styles.input, error && styles.invalid, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          <ErrorIcon />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
