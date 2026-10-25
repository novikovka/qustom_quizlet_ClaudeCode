import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/dist', '**/coverage', '**/node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Параметры с «_» в начале нужны по сигнатуре, но не используются
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Сервер работает в Node.js
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  // Интерфейс работает в браузере
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // Отключает правила, которые спорят с Prettier
  prettier,
);
