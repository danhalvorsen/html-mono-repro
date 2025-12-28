import { defineConfig } from 'vitest/config.js';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    isolate: false,
    pool: 'threads',
  },

  resolve: {
    alias: {
      '@my-graphics/core-ioc': path.resolve(__dirname, './src'),
    },
    preserveSymlinks: true,
  },
});
