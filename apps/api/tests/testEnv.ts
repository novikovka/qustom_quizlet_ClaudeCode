import path from 'node:path';
import { config } from 'dotenv';

// Берём настройки из apps/api/.env, но подменяем имя базы на flashcards_test,
// чтобы тесты никогда не трогали основную базу
config({ path: path.resolve(import.meta.dirname, '../.env'), quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL не задан в apps/api/.env');
}

const url = new URL(process.env.DATABASE_URL);
url.pathname = '/flashcards_test';

export const TEST_DATABASE_URL = url.toString();

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.SESSION_SECRET ??= 'test-secret';
