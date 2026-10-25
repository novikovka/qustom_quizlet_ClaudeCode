// testEnv импортируется первым, чтобы подключение к базе создалось уже с адресом тестовой базы
import { TEST_DATABASE_URL } from './testEnv.js';
import { afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/db.js';

if (!TEST_DATABASE_URL.includes('/flashcards_test')) {
  throw new Error('Тесты запускаются только на базе flashcards_test');
}

// Перед каждым тестом база пустая
beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE users, decks, cards, session RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await prisma.$disconnect();
});
