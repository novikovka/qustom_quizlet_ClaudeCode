import type { RequestHandler } from 'express';

// Пропускает дальше только вошедшего пользователя
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Нужно войти' });
    return;
  }
  next();
};
