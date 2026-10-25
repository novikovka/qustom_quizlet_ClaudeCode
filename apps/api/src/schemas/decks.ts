import { z } from 'zod';

const deckName = z
  .string({ error: 'Введите название' })
  .trim()
  .min(1, 'Введите название')
  .max(100, 'Название не длиннее 100 символов');

export const deckSchema = z.object({ name: deckName }, { error: 'Неверный формат запроса' });

export type DeckInput = z.infer<typeof deckSchema>;
