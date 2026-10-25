import { Link } from 'react-router';
import type { DeckSummary } from '../../api/decks';
import { deckColorVars } from '../../lib/deckColors';
import { cardsText } from '../../lib/plural';
import { buttonClass } from '../buttonClass';
import { IconButton } from '../Button';
import { PencilIcon, PlayIcon, PlusIcon, TrashIcon } from '../icons';
import { DeckCover } from './DeckCover';
import styles from './DeckCard.module.css';

type Props = {
  deck: DeckSummary;
  // Порядковый номер в сетке — для появления карточек по очереди
  index: number;
  onRename: () => void;
  onDelete: () => void;
};

// Карточка колоды в сетке на экране «Мои колоды» (DESIGN.md, экран 1)
export function DeckCard({ deck, index, onRename, onDelete }: Props) {
  const first = deck.previewCards[0];
  const empty = deck.cardCount === 0;

  return (
    <article
      className={`${styles.card} ${empty ? styles.empty : ''}`}
      style={{ ...deckColorVars(deck.colorIndex), animationDelay: `${index * 0.07}s` }}
    >
      {empty ? (
        <div className={styles.emptyCover}>
          <span className={styles.emptyTitle}>Пустая колода</span>
          <span className={styles.emptyText}>Добавьте карточки, чтобы начать листать.</span>
        </div>
      ) : (
        <DeckCover colorIndex={deck.colorIndex} word={first.en} caption={first.ru} />
      )}

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div className={styles.titleBox}>
            <h2 className={styles.name}>{deck.name}</h2>
            <p className={styles.count}>{cardsText(deck.cardCount)}</p>
          </div>
          <div className={styles.tools}>
            <IconButton aria-label={`Переименовать колоду «${deck.name}»`} onClick={onRename}>
              <PencilIcon />
            </IconButton>
            <IconButton aria-label={`Удалить колоду «${deck.name}»`} danger onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          </div>
        </div>

        {!empty && (
          <p className={styles.words} lang="en">
            {deck.previewCards.map((c) => c.en).join(' · ')}
          </p>
        )}

        <div className={styles.actions}>
          {empty ? (
            <Link
              to={`/decks/${deck.id}`}
              className={buttonClass({ variant: 'secondary', size: 'small', fullWidth: true })}
            >
              <PlusIcon size={18} />
              Добавить карточки
            </Link>
          ) : (
            <>
              <Link
                to={`/decks/${deck.id}/study`}
                className={buttonClass({ size: 'small' })}
                aria-label={`Листать колоду «${deck.name}»`}
              >
                <PlayIcon size={16} />
                Листать
              </Link>
              <Link
                to={`/decks/${deck.id}`}
                className={buttonClass({ variant: 'outline', size: 'small' })}
                aria-label={`Открыть колоду «${deck.name}»`}
              >
                Открыть
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
