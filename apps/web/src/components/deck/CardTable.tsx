import { useState } from 'react';
import type { Card } from '../../api/decks';
import { useCardEditor } from './useCardEditor';
import { deckColorVars } from '../../lib/deckColors';
import { Button, IconButton } from '../Button';
import { PencilIcon, TrashIcon } from '../icons';
import styles from './CardTable.module.css';

type Props = {
  cards: Card[];
  // id только что добавленной карточки — её строка подсвечивается
  highlightId: number | null;
  onSave: (id: number, en: string, ru: string) => Promise<boolean>;
  onDelete: (card: Card) => void;
};

// Таблица карточек колоды (DESIGN.md, экран 4). Редактировать можно одну строку за раз
export function CardTable({ cards, highlightId, onSave, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.numCol}>
              №
            </th>
            <th scope="col">Английский</th>
            <th scope="col">Перевод</th>
            <th scope="col" className={styles.actionsCol}>
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, i) =>
            card.id === editingId ? (
              <EditRow
                key={card.id}
                card={card}
                number={i + 1}
                onCancel={() => setEditingId(null)}
                onSave={async (en, ru) => {
                  if (await onSave(card.id, en, ru)) setEditingId(null);
                }}
              />
            ) : (
              <tr key={card.id} className={card.id === highlightId ? styles.fresh : undefined}>
                <td>
                  <Num value={i + 1} />
                </td>
                <td className={styles.en} lang="en">
                  {card.en}
                </td>
                <td className={styles.ru}>{card.ru}</td>
                <td className={styles.actions}>
                  <IconButton
                    aria-label={`Изменить карточку «${card.en}»`}
                    onClick={() => setEditingId(card.id)}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Удалить карточку «${card.en}»`}
                    danger
                    onClick={() => onDelete(card)}
                  >
                    <TrashIcon />
                  </IconButton>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

// Номер строки в цветном квадратике, цвета по кругу
function Num({ value }: { value: number }) {
  return (
    <span className={styles.num} style={deckColorVars(value - 1)}>
      {value}
    </span>
  );
}

type EditRowProps = {
  card: Card;
  number: number;
  onCancel: () => void;
  onSave: (en: string, ru: string) => Promise<void>;
};

// Строка в режиме редактирования: Enter сохраняет, Esc отменяет
function EditRow({ card, number, onCancel, onSave }: EditRowProps) {
  const { en, ru, setEn, setRu, saving, save, onKeyDown, enError, ruError } = useCardEditor(
    card,
    onSave,
    onCancel,
  );
  const enEmpty = Boolean(enError);
  const ruEmpty = Boolean(ruError);

  return (
    <tr className={styles.editing}>
      <td>
        <Num value={number} />
      </td>
      <td>
        <input
          className={`${styles.input} ${styles.inputEn} ${enEmpty ? styles.invalid : ''}`}
          aria-label="Английский"
          aria-invalid={enEmpty || undefined}
          lang="en"
          maxLength={200}
          value={en}
          onChange={(e) => setEn(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        {enError && <span className={styles.error}>{enError}</span>}
      </td>
      <td>
        <input
          className={`${styles.input} ${ruEmpty ? styles.invalid : ''}`}
          aria-label="Перевод"
          aria-invalid={ruEmpty || undefined}
          maxLength={200}
          value={ru}
          onChange={(e) => setRu(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {ruError && <span className={styles.error}>{ruError}</span>}
      </td>
      <td className={styles.actions}>
        <Button size="small" loading={saving} onClick={save}>
          Сохранить
        </Button>
        <Button size="small" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </td>
    </tr>
  );
}
