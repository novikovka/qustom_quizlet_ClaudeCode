import { useId, useState, type FormEvent } from 'react';
import { decksApi, type DeckSummary } from '../../api/decks';
import { ApiError } from '../../api/client';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { FormError } from '../FormError';
import { DeckCover } from './DeckCover';
import parts from '../ModalParts.module.css';
import styles from './DeckModals.module.css';

type Props = {
  // Цвет будущей колоды — следующий по кругу
  colorIndex: number;
  onClose: () => void;
  onCreated: (deck: DeckSummary) => void;
};

// Окно «Новая колода» (DESIGN.md, экран 3)
export function NewDeckModal({ colorIndex, onClose, onCreated }: Props) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempt((n) => n + 1);
    setServerError('');
    if (!name.trim()) {
      setError('Введите название');
      return;
    }
    setError('');
    setSaving(true);
    try {
      onCreated(await decksApi.create(name.trim()));
    } catch (err) {
      // 400 — ошибка в самом названии, показываем под полем
      if (err instanceof ApiError && err.status === 400) setError(err.message);
      else setServerError(err instanceof ApiError ? err.message : 'Не удалось создать колоду');
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy={titleId}>
      <DeckCover
        colorIndex={colorIndex}
        word={name.trim() || 'Новая колода'}
        className={styles.cover}
      >
        <span className={styles.coverBadge}>0 карточек</span>
      </DeckCover>
      <h2 id={titleId} className={parts.title}>
        Новая колода
      </h2>
      <form className={parts.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Название"
          hint="Например: тема, учебник или фильм"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
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
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
