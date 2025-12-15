import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@my-graphics/core-filesystem': path.resolve(__dirname, '../core-filesystem/src/index.ts'),
      '@my-graphics/core-logger': path.resolve(__dirname, '../core-logger/src/LoggerProvider.ts')
    },
    preserveSymlinks: true
  }
});
