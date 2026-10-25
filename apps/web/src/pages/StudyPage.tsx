import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { decksApi, type Card, type DeckDetail } from '../api/decks';
import { ApiError } from '../api/client';
import { buttonClass } from '../components/buttonClass';
import { Button, IconButton } from '../components/Button';
import { ChevronLeftIcon, ChevronRightIcon, ShuffleIcon } from '../components/icons';
import { Skeleton } from '../components/Skeleton';
import { LoadError } from '../components/LoadError';
import { FlashCard, type Side } from '../components/study/FlashCard';
import { DeckFinished } from '../components/study/DeckFinished';
import styles from './StudyPage.module.css';

type Load =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; deck: DeckDetail };

// Экран «Просмотр» (DESIGN.md, экраны 7, 8, 13)
export function StudyPage() {
  const { id } = useParams();
  const deckId = Number(id);
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  const fetchDeck = useCallback(
    () =>
      decksApi
        .get(deckId)
        .then((deck) => setLoad({ status: 'ready', deck }))
        .catch((error) =>
          setLoad(
            error instanceof ApiError && error.status === 404
              ? { status: 'notFound' }
              : { status: 'error', error },
          ),
        ),
    [deckId],
  );

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  return (
    <main className={styles.main}>
      <div className={styles.bg} aria-hidden="true">
        <span className={styles.bgCircle} />
        <span className={styles.bgCircle} />
        <span className={styles.bgCircle} />
      </div>

      {load.status === 'loading' && (
        <div className={styles.column} aria-busy="true" aria-label="Загрузка колоды">
          <Skeleton style={{ width: 220, height: 24, marginBottom: 28 }} />
          <Skeleton style={{ height: 340, borderRadius: 28 }} />
        </div>
      )}

      {load.status === 'error' && (
        <LoadError
          error={load.error}
          what="Карточки"
          onRetry={() => {
            setLoad({ status: 'loading' });
            fetchDeck();
          }}
        />
      )}

      {load.status === 'notFound' && (
        <Message
          title="Колода не найдена"
          text="Возможно, её удалили или ссылка неверная."
          to="/"
          action="Ко всем колодам"
        />
      )}

      {load.status === 'ready' &&
        (load.deck.cards.length === 0 ? (
          <Message
            title="В колоде пока нет карточек"
            text="Добавьте хотя бы одну карточку, чтобы начать листать."
            to={`/decks/${deckId}`}
            action="Добавить карточки"
          />
        ) : (
          <Study deck={load.deck} />
        ))}
    </main>
  );
}

type Direction = 'en-ru' | 'ru-en';

// Случайный порядок (тасование Фишера — Йетса); если вышел тот же порядок — тасуем ещё раз
function shuffled(cards: Card[]): Card[] {
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = [...cards];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (cards.length < 2 || result.some((c, i) => c.id !== cards[i].id)) return result;
  }
  return [...cards];
}

function Study({ deck }: { deck: DeckDetail }) {
  const [order, setOrder] = useState(deck.cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<Direction>('en-ru');
  const [isShuffled, setIsShuffled] = useState(false);
  const [finished, setFinished] = useState(false);

  const total = order.length;
  const card = order[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // При смене карточки она показывается лицевой стороной
  const goTo = (i: number) => {
    setIndex(i);
    setFlipped(false);
  };
  const prev = () => !isFirst && goTo(index - 1);
  const next = () => !isLast && goTo(index + 1);
  const flip = () => setFlipped((f) => !f);

  const shuffle = () => {
    setOrder(shuffled(deck.cards));
    setIsShuffled(true);
    setFinished(false);
    goTo(0);
  };

  const restart = () => {
    setFinished(false);
    goTo(0);
  };

  const changeDirection = (d: Direction) => {
    setDirection(d);
    setFlipped(false);
  };

  // Клавиши: Пробел — перевернуть, ← → — листать. Обработчики берём из ref,
  // чтобы не переподписываться на каждое нажатие
  const keys = useRef({ prev, next, flip });
  useEffect(() => {
    keys.current = { prev, next, flip };
  });

  useEffect(() => {
    if (finished) return;
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.matches('input, textarea, select') || t.isContentEditable);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || typing(e.target)) return;
      if (e.key === ' ') {
        // Пробел всегда переворачивает карточку, даже если фокус на другой кнопке
        e.preventDefault();
        if (!e.repeat) keys.current.flip();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        keys.current.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        keys.current.next();
      }
    };
    // Отпускание пробела на кнопке тоже нажимает её — гасим
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && !typing(e.target)) e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [finished]);

  if (finished) {
    return (
      <div className={styles.column}>
        <DeckFinished deckName={deck.name} total={total} onRestart={restart} onShuffle={shuffle} />
      </div>
    );
  }

  const en: Side = { label: 'English', text: card.en, lang: 'en' };
  const ru: Side = { label: 'Перевод', text: card.ru, lang: 'ru' };
  const [front, back] = direction === 'en-ru' ? [en, ru] : [ru, en];

  return (
    <div className={styles.column}>
      <div className={styles.top}>
        <Link to={`/decks/${deck.id}`} className={styles.back}>
          <ChevronLeftIcon size={18} />
          <span className={styles.backText}>{deck.name}</span>
        </Link>
        <div className={styles.controls}>
          <div className={styles.segments} role="group" aria-label="Какая сторона первая">
            <button
              type="button"
              className={styles.segment}
              aria-pressed={direction === 'en-ru'}
              onClick={() => changeDirection('en-ru')}
            >
              EN → RU
            </button>
            <button
              type="button"
              className={styles.segment}
              aria-pressed={direction === 'ru-en'}
              onClick={() => changeDirection('ru-en')}
            >
              RU → EN
            </button>
          </div>
          <Button variant="outline" size="small" className={styles.shuffleText} onClick={shuffle}>
            <ShuffleIcon size={18} />
            Перемешать
          </Button>
        </div>
        <IconButton aria-label="Перемешать" className={styles.shuffleIcon} onClick={shuffle}>
          <ShuffleIcon />
        </IconButton>
      </div>

      <div className={styles.status}>
        <p className={styles.counter} aria-live="polite">
          {index + 1} / {total}
        </p>
        {isShuffled && <span className={styles.shuffledBadge}>Перемешано</span>}
      </div>
      <div className={styles.progress} aria-hidden="true">
        {order.map((c, i) => (
          <span
            key={c.id}
            className={i === index ? styles.current : i < index ? styles.done : styles.pending}
          />
        ))}
      </div>

      {/* key: новая карточка или новое направление монтируются заново лицевой стороной,
          без анимации переворота — иначе на миг мелькнул бы ответ */}
      <FlashCard
        key={`${card.id}-${direction}`}
        front={front}
        back={back}
        flipped={flipped}
        onFlip={flip}
      />

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.round}
          aria-label="Предыдущая карточка"
          disabled={isFirst}
          onClick={prev}
        >
          <ChevronLeftIcon size={24} />
        </button>
        <Button variant="dark" className={styles.flipButton} onClick={flip}>
          Перевернуть
        </Button>
        {isLast ? (
          <Button className={styles.finish} onClick={() => setFinished(true)}>
            Завершить
          </Button>
        ) : (
          <button
            type="button"
            className={styles.round}
            aria-label="Следующая карточка"
            onClick={next}
          >
            <ChevronRightIcon size={24} />
          </button>
        )}
      </div>

      <p className={styles.keys}>
        <kbd>Пробел</kbd> перевернуть <kbd>←</kbd> <kbd>→</kbd> листать
      </p>
    </div>
  );
}

function Message({
  title,
  text,
  to,
  action,
}: {
  title: string;
  text: string;
  to: string;
  action: string;
}) {
  return (
    <div className={styles.message}>
      <h1 className={styles.messageTitle}>{title}</h1>
      <p className={styles.messageText}>{text}</p>
      <Link to={to} className={buttonClass()}>
        {action}
      </Link>
    </div>
  );
}
