import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    isolate: false,
    pool: 'threads',
  },

  resolve: {},
});
