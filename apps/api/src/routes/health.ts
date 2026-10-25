import { Router } from 'express';
import { prisma } from '../db.js';

export const healthRouter = Router();

// Проверка, что сервер работает и база отвечает
healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(503).json({ error: 'База данных недоступна' });
  }
});
