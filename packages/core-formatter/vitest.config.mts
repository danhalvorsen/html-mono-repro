import { defineConfig } from 'vitest/config.js';

export default defineConfig({
  test: {
    globals: true,
    tsconfig: './tsconfig.test.json',
    include: ['tests/**/*.test.ts'],
  },
});
