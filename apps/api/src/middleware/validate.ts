import type { RequestHandler } from 'express';
import type { z } from 'zod';

// Проверяет тело запроса по схеме. При ошибке — 400 с первым сообщением,
// иначе заменяет req.body очищенными данными (обрезанный email и т. п.)
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message ?? 'Неверные данные' });
      return;
    }
    req.body = result.data;
    next();
  };
}
