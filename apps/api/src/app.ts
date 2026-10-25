import express from 'express';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { decksRouter } from './routes/decks.js';
import { cardsRouter } from './routes/cards.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { createSessionMiddleware } from './session.js';

// Приложение собирается отдельно от запуска, чтобы в тестах его можно было
// использовать без открытия порта
export const app = express();

app.use(express.json());
app.use(createSessionMiddleware());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/decks', decksRouter);
app.use('/api/cards', cardsRouter);

app.use('/api', notFound);
app.use(errorHandler);
