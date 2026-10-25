import { useState, type KeyboardEvent } from 'react';
import type { Card } from '../../api/decks';

// Правка карточки — общая для строки таблицы и пункта мобильного списка:
// значения полей, проверка на пустоту, сохранение, Enter — сохранить, Esc — отменить
export function useCardEditor(
  card: Card,
  onSave: (en: string, ru: string) => Promise<void>,
  onCancel: () => void,
) {
  const [en, setEn] = useState(card.en);
  const [ru, setRu] = useState(card.ru);
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);

  async function save() {
    setTried(true);
    if (!en.trim() || !ru.trim()) return;
    // Ничего не поменялось — просто выходим из редактирования
    if (en.trim() === card.en && ru.trim() === card.ru) return onCancel();
    setSaving(true);
    await onSave(en.trim(), ru.trim());
    setSaving(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }

  return {
    en,
    ru,
    setEn,
    setRu,
    saving,
    save,
    onKeyDown,
    enError: tried && !en.trim() ? 'Введите слово' : undefined,
    ruError: tried && !ru.trim() ? 'Введите перевод' : undefined,
  };
}
