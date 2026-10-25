import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Запросы /api уходят на сервер, поэтому интерфейс и API живут на одном адресе
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
