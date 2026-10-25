import { z } from 'zod';

const en = z
  .string({ error: 'Введите слово' })
  .trim()
  .min(1, 'Введите слово')
  .max(200, 'Слово или фраза не длиннее 200 символов');

const ru = z
  .string({ error: 'Введите перевод' })
  .trim()
  .min(1, 'Введите перевод')
  .max(200, 'Перевод не длиннее 200 символов');

export const createCardSchema = z.object({ en, ru }, { error: 'Неверный формат запроса' });

// При изменении можно прислать одно поле или оба
export const updateCardSchema = z
  .object({ en: en.optional(), ru: ru.optional() }, { error: 'Неверный формат запроса' })
  .refine((data) => data.en !== undefined || data.ru !== undefined, {
    error: 'Нечего изменять',
  });

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
