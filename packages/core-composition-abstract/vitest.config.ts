import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
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
