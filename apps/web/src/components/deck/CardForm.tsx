import { useRef, useState, type FormEvent } from 'react';
import { TextField } from '../TextField';
import { Button } from '../Button';
import { PlusIcon } from '../icons';
import styles from './CardForm.module.css';

type Props = {
  // true — карточка добавлена, поля можно очистить
  onAdd: (en: string, ru: string) => Promise<boolean>;
};

// Форма «Новая карточка» (DESIGN.md, экраны 4–5)
export function CardForm({ onAdd }: Props) {
  const [en, setEn] = useState('');
  const [ru, setRu] = useState('');
  const [errors, setErrors] = useState<{ en?: string; ru?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const enRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempt((n) => n + 1);
    const next = {
      en: en.trim() ? undefined : 'Введите слово',
      ru: ru.trim() ? undefined : 'Введите перевод',
    };
    setErrors(next);
    if (next.en || next.ru) return;

    setSaving(true);
    const added = await onAdd(en.trim(), ru.trim());
    setSaving(false);
    if (added) {
      setEn('');
      setRu('');
    }
    // Следующее слово можно вводить сразу
    enRef.current?.focus();
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="new-card-title"
    >
      <h2 id="new-card-title" className={styles.title}>
        Новая карточка
      </h2>
      <div className={styles.row}>
        <TextField
          ref={enRef}
          label="Английский"
          placeholder="например, carry on"
          className={styles.en}
          lang="en"
          autoComplete="off"
          maxLength={200}
          value={en}
          onChange={(e) => setEn(e.target.value)}
          error={errors.en}
          shakeKey={attempt}
        />
        <TextField
          label="Перевод"
          placeholder="например, продолжать"
          autoComplete="off"
          maxLength={200}
          value={ru}
          onChange={(e) => setRu(e.target.value)}
          error={errors.ru}
          shakeKey={attempt}
        />
        <Button type="submit" variant="dark" loading={saving} className={styles.submit}>
          {!saving && <PlusIcon size={18} />}
          Добавить
        </Button>
      </div>
    </form>
  );
}
