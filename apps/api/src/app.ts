import express from 'express';
import { healthRouter } from './routes/health.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Приложение собирается отдельно от запуска, чтобы в тестах его можно было
// использовать без открытия порта
export const app = express();

app.use(express.json());

app.use('/api/health', healthRouter);

app.use('/api', notFound);
app.use(errorHandler);
