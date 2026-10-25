import { z } from 'zod';

const email = z
  .string({ error: 'Введите email' })
  .trim()
  .toLowerCase()
  .min(1, 'Введите email')
  .max(254, 'Слишком длинный email')
  .pipe(z.email('Введите корректный email'));

export const registerSchema = z.object(
  {
    email,
    password: z
      .string({ error: 'Введите пароль' })
      .min(8, 'Пароль должен быть не короче 8 символов')
      .max(200, 'Пароль слишком длинный'),
  },
  { error: 'Неверный формат запроса' },
);

// При входе правила длины не подсказываем — только проверяем, что пароль введён
export const loginSchema = z.object(
  {
    email,
    password: z.string({ error: 'Введите пароль' }).min(1, 'Введите пароль').max(200),
  },
  { error: 'Неверный формат запроса' },
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
