import { Link } from 'react-router';
import type { DeckSummary } from '../../api/decks';
import { deckColorVars } from '../../lib/deckColors';
import { cardsText } from '../../lib/plural';
import { MoreMenu } from '../MoreMenu';
import { PlayIcon, PlusIcon } from '../icons';
import styles from './DeckRow.module.css';

type Props = {
  deck: DeckSummary;
  index: number;
  onRename: () => void;
  onDelete: () => void;
};

// Колода строкой списка — телефонная раскладка (DESIGN.md, экран 11)
export function DeckRow({ deck, index, onRename, onDelete }: Props) {
  const empty = deck.cardCount === 0;

  return (
    <li
      className={styles.row}
      style={{ ...deckColorVars(deck.colorIndex), animationDelay: `${index * 0.07}s` }}
    >
      <Link to={`/decks/${deck.id}`} className={styles.main}>
        <span className={styles.square} aria-hidden="true">
          <span className={styles.mini}>{deck.name.slice(0, 2)}</span>
        </span>
        <span className={styles.info}>
          <span className={styles.name}>{deck.name}</span>
          <span className={styles.count}>{cardsText(deck.cardCount)}</span>
        </span>
      </Link>
      {empty ? (
        <Link
          to={`/decks/${deck.id}`}
          className={`${styles.round} ${styles.add}`}
          aria-label={`Добавить карточки в колоду «${deck.name}»`}
        >
          <PlusIcon size={20} />
        </Link>
      ) : (
        <Link
          to={`/decks/${deck.id}/study`}
          className={styles.round}
          aria-label={`Листать колоду «${deck.name}»`}
        >
          <PlayIcon size={18} />
        </Link>
      )}
      <MoreMenu
        label={`Действия с колодой «${deck.name}»`}
        items={[
          { label: 'Переименовать', onClick: onRename },
          { label: 'Удалить', onClick: onDelete, danger: true },
        ]}
      />
    </li>
  );
}
