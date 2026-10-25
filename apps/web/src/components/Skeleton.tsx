import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

// Заглушка на время загрузки: серый блок с бегущим бликом
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    />
  );
}
