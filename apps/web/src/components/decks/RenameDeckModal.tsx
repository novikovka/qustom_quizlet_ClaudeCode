import { useId, useState, type FormEvent } from 'react';
import { decksApi, type DeckBase } from '../../api/decks';
import { ApiError } from '../../api/client';
import { deckColorVars } from '../../lib/deckColors';
import { cardsText, plural } from '../../lib/plural';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { FormError } from '../FormError';
import { PencilIcon } from '../icons';
import parts from '../ModalParts.module.css';
import styles from './DeckModals.module.css';

type Props = {
  deck: DeckBase;
  onClose: () => void;
  onRenamed: (deck: DeckBase) => void;
};

// Окно «Переименовать колоду» (DESIGN.md, экран 6)
export function RenameDeckModal({ deck, onClose, onRenamed }: Props) {
  const titleId = useId();
  const [name, setName] = useState(deck.name);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempt((n) => n + 1);
    setServerError('');
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Введите название');
      return;
    }
    // Название не изменилось — просто закрываем окно
    if (trimmed === deck.name) {
      onClose();
      return;
    }
    setError('');
    setSaving(true);
    try {
      onRenamed(await decksApi.rename(deck.id, trimmed));
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setError(err.message);
      else setServerError(err instanceof ApiError ? err.message : 'Не удалось сохранить');
      setSaving(false);
    }
  }

  const n = deck.cardCount;
  const remains =
    n === 0
      ? 'В колоде пока нет карточек'
      : `${cardsText(n)} ${plural(n, ['останется', 'останутся', 'останутся'])} в колоде`;

  return (
    <Modal onClose={onClose} labelledBy={titleId}>
      <span className={styles.badgeIcon} style={deckColorVars(deck.colorIndex)} aria-hidden="true">
        <PencilIcon size={24} />
      </span>
      <h2 id={titleId} className={parts.title}>
        Переименовать колоду
      </h2>
      <p className={styles.renameLine} aria-hidden="true">
        <s className={styles.oldName}>{deck.name}</s>
        <span className={styles.arrow}>→</span>
        <span className={styles.newName}>{name.trim() || '…'}</span>
      </p>
      <form className={parts.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Новое название"
          hint={remains}
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          error={error}
          shakeKey={attempt}
          autoFocus
        />
        {serverError && <FormError message={serverError} />}
        <div className={parts.actions}>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={saving}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
