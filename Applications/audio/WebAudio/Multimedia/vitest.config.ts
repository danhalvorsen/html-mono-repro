import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
    tsconfig: './tsconfig.tests.json',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['Packages/**/src/**', 'composite-design-pattern/src/**']
    }
  }
});
