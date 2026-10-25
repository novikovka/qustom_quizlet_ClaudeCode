import { execSync } from 'node:child_process';
import path from 'node:path';
import './testEnv.js';

// Один раз перед всеми тестами: создаёт базу flashcards_test (если её нет)
// и применяет к ней миграции
export default function setup() {
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(import.meta.dirname, '..'),
    env: process.env,
    stdio: 'pipe',
  });
}
