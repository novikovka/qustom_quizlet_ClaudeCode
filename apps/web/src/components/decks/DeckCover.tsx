import type { ReactNode } from 'react';
import { deckColorVars } from '../../lib/deckColors';
import styles from './DeckCover.module.css';

type Props = {
  colorIndex: number;
  // Слово на белом стикере (Literata) и подпись на тёмной плашке под ним
  word: string;
  caption?: string;
  className?: string;
  children?: ReactNode;
};

// Обложка колоды: светлый цвет колоды, полупрозрачные круги и «парящий» стикер
export function DeckCover({ colorIndex, word, caption, className, children }: Props) {
  return (
    <div
      className={[styles.cover, className].filter(Boolean).join(' ')}
      style={deckColorVars(colorIndex)}
      aria-hidden="true"
    >
      <span className={`${styles.circle} ${styles.circleBig}`} />
      <span className={`${styles.circle} ${styles.circleSmall}`} />
      <span className={styles.stack}>
        <span className={styles.sticker}>{word}</span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </span>
      {children}
    </div>
  );
}
