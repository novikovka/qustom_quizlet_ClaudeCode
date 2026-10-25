import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './tests/globalSetup.ts',
    setupFiles: ['./tests/setup.ts'],
    // Все тесты работают с одной базой, поэтому файлы идут по очереди
    fileParallelism: false,
  },
});
