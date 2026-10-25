import type { ErrorRequestHandler, RequestHandler } from 'express';

// Неизвестный адрес API
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Не найдено' });
};

// Любая необработанная ошибка: подробности — в консоль сервера, пользователю — общий текст
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};
