import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { DECK_COLORS } from '../../lib/deckColors';
import { plural } from '../../lib/plural';
import { Button } from '../Button';
import { ShuffleIcon } from '../icons';
import styles from './DeckFinished.module.css';

type Props = {
  deckName: string;
  total: number;
  onRestart: () => void;
  onShuffle: () => void;
};

const CONFETTI_COUNT = 70;

// Псевдослучайное число 0–1, одинаковое при каждой отрисовке (Math.random в отрисовке нельзя)
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Кусочки конфетти: цвет колод, место, задержка, скорость и поворот
const CONFETTI = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  left: `${rand(i, 1) * 100}%`,
  delay: `${rand(i, 2) * 1.2}s`,
  duration: `${2.4 + rand(i, 3) * 1.8}s`,
  rotate: `${Math.round(rand(i, 4) * 720 - 360)}deg`,
  color: DECK_COLORS[i % DECK_COLORS.length].strong,
  round: rand(i, 5) > 0.7,
}));

// Экран после последней карточки (DESIGN.md, экран 8)
export function DeckFinished({ deckName, total, onRestart, onShuffle }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Экранный диктор сразу прочитает заголовок, а клавиатура окажется у кнопок
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const text =
    total === 1
      ? `Вы просмотрели единственную карточку колоды «${deckName}».`
      : `Вы просмотрели все ${total} ${plural(total, ['карточку', 'карточки', 'карточек'])} колоды «${deckName}».`;

  // Конфетти — вне анимированного блока: пока у предка идёт transform-анимация,
  // position: fixed считался бы от него, а не от экрана
  return (
    <>
      <div className={styles.confetti} aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={`${styles.piece} ${c.round ? styles.round : ''}`}
            style={
              {
                left: c.left,
                background: c.color,
                animationDelay: c.delay,
                animationDuration: c.duration,
                '--rotate': c.rotate,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <section className={styles.wrap}>
        <div className={styles.art} aria-hidden="true">
          <span className={styles.stack} style={{ background: DECK_COLORS[3].light }} />
          <span className={styles.stack} style={{ background: DECK_COLORS[1].light }} />
          <span className={styles.top}>
            <svg viewBox="0 0 52 52" className={styles.check}>
              <path d="M14 27l8 8 16-17" />
            </svg>
          </span>
        </div>

        <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
          Колода пролистана!
        </h1>
        <p className={styles.text}>{text}</p>

        <div className={styles.actions}>
          <Button onClick={onRestart}>Листать снова</Button>
          <Button variant="outline" onClick={onShuffle}>
            <ShuffleIcon size={18} />
            Перемешать и заново
          </Button>
        </div>
        <Link to="/" className={styles.link}>
          Ко всем колодам
        </Link>
      </section>
    </>
  );
}
