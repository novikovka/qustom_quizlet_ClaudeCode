import { useId, useState } from 'react';
import { decksApi, type DeckBase } from '../../api/decks';
import { ApiError } from '../../api/client';
import { deckColorVars } from '../../lib/deckColors';
import { cardsText, plural } from '../../lib/plural';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { FormError } from '../FormError';
import { TrashIcon } from '../icons';
import parts from '../ModalParts.module.css';
import styles from './DeckModals.module.css';

type Props = {
  deck: DeckBase;
  onClose: () => void;
  onDeleted: (deck: DeckBase) => void;
};

// Подтверждение удаления колоды (DESIGN.md, экран 9)
export function DeleteDeckModal({ deck, onClose, onDeleted }: Props) {
  const titleId = useId();
  const textId = useId();
  const [deleting, setDeleting] = useState(false);
  const [serverError, setServerError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setServerError('');
    try {
      await decksApi.remove(deck.id);
      onDeleted(deck);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось удалить колоду');
      setDeleting(false);
    }
  }

  const n = deck.cardCount;
  const text =
    n === 0
      ? 'Колода пустая. Отменить это действие нельзя.'
      : `Вместе с колодой ${plural(n, ['удалится', 'удалятся', 'удалятся'])} ${cardsText(n)}. Отменить это действие нельзя.`;

  return (
    <Modal onClose={onClose} labelledBy={titleId} describedBy={textId} role="alertdialog">
      <div className={styles.fan} style={deckColorVars(deck.colorIndex)} aria-hidden="true">
        <span className={styles.fanCard} />
        <span className={styles.fanCard} />
        <span className={styles.fanCard}>×{n}</span>
        <span className={styles.trash}>
          <TrashIcon size={22} />
        </span>
      </div>
      <h2 id={titleId} className={parts.title}>
        Удалить колоду «{deck.name}»?
      </h2>
      <p id={textId} className={parts.text}>
        {text}
      </p>
      {serverError && (
        <div className={styles.errorGap}>
          <FormError message={serverError} />
        </div>
      )}
      <div className={parts.actionsSplit}>
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>
          Удалить
        </Button>
      </div>
    </Modal>
  );
}
