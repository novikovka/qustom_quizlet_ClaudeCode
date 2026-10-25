import { useState } from 'react';
import type { Card } from '../../api/decks';
import { Button } from '../Button';
import { MoreMenu } from '../MoreMenu';
import { useCardEditor } from './useCardEditor';
import styles from './CardList.module.css';

type Props = {
  cards: Card[];
  highlightId: number | null;
  onSave: (id: number, en: string, ru: string) => Promise<boolean>;
  onDelete: (card: Card) => void;
};

// Карточки списком «слово / перевод» с меню «⋯» — телефонная раскладка (DESIGN.md, экран 12)
export function CardList({ cards, highlightId, onSave, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <ul className={styles.list}>
      {cards.map((card) =>
        card.id === editingId ? (
          <EditItem
            key={card.id}
            card={card}
            onCancel={() => setEditingId(null)}
            onSave={async (en, ru) => {
              if (await onSave(card.id, en, ru)) setEditingId(null);
            }}
          />
        ) : (
          <li
            key={card.id}
            className={`${styles.item} ${card.id === highlightId ? styles.fresh : ''}`}
          >
            <div className={styles.texts}>
              <span className={styles.en} lang="en">
                {card.en}
              </span>
              <span className={styles.ru}>{card.ru}</span>
            </div>
            <MoreMenu
              label={`Действия с карточкой «${card.en}»`}
              items={[
                { label: 'Изменить', onClick: () => setEditingId(card.id) },
                { label: 'Удалить', onClick: () => onDelete(card), danger: true },
              ]}
            />
          </li>
        ),
      )}
    </ul>
  );
}

type EditItemProps = {
  card: Card;
  onCancel: () => void;
  onSave: (en: string, ru: string) => Promise<void>;
};

function EditItem({ card, onCancel, onSave }: EditItemProps) {
  const { en, ru, setEn, setRu, saving, save, onKeyDown, enError, ruError } = useCardEditor(
    card,
    onSave,
    onCancel,
  );

  return (
    <li className={`${styles.item} ${styles.editing}`}>
      <input
        className={`${styles.input} ${styles.inputEn} ${enError ? styles.invalid : ''}`}
        aria-label="Английский"
        aria-invalid={Boolean(enError) || undefined}
        lang="en"
        maxLength={200}
        value={en}
        onChange={(e) => setEn(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
      />
      {enError && <span className={styles.error}>{enError}</span>}
      <input
        className={`${styles.input} ${ruError ? styles.invalid : ''}`}
        aria-label="Перевод"
        aria-invalid={Boolean(ruError) || undefined}
        maxLength={200}
        value={ru}
        onChange={(e) => setRu(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {ruError && <span className={styles.error}>{ruError}</span>}
      <div className={styles.editActions}>
        <Button size="small" loading={saving} onClick={save}>
          Сохранить
        </Button>
        <Button size="small" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </li>
  );
}
