import styles from './FlashCard.module.css';

export type Side = { label: string; text: string; lang: 'en' | 'ru' };

type Props = {
  front: Side;
  back: Side;
  flipped: boolean;
  onFlip: () => void;
};

// Длинные фразы набираются мельче, чтобы поместиться на карточке
function sizeClass(text: string) {
  if (text.length > 60) return styles.small;
  if (text.length > 22) return styles.medium;
  return '';
}

// Карточка просмотра (DESIGN.md, экран 7): лицевая сторона белая, оборотная тёмная,
// переворот — 3D-поворот по оси Y. Вся карточка — одна кнопка
export function FlashCard({ front, back, flipped, onFlip }: Props) {
  return (
    <button
      type="button"
      className={`${styles.card} ${flipped ? styles.flipped : ''}`}
      onClick={onFlip}
      aria-label={`${flipped ? back.text : front.text}. Нажмите, чтобы перевернуть`}
    >
      <span className={styles.inner}>
        <Face side={front} kind="front" hint="Нажмите, чтобы перевернуть" />
        <Face side={back} kind="back" hint="Нажмите, чтобы вернуться" />
      </span>
    </button>
  );
}

function Face({ side, kind, hint }: { side: Side; kind: 'front' | 'back'; hint: string }) {
  return (
    <span className={`${styles.face} ${styles[kind]}`} aria-hidden="true">
      <span className={`${styles.circle} ${styles.circleTop}`} />
      <span className={`${styles.circle} ${styles.circleBottom}`} />
      <span className={styles.label}>{side.label}</span>
      <span
        className={`${styles.text} ${side.lang === 'en' ? styles.en : styles.ru} ${sizeClass(side.text)}`}
        lang={side.lang}
      >
        {side.text}
      </span>
      <span className={styles.hint}>{hint}</span>
    </span>
  );
}
