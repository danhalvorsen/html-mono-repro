import { defineConfig } from 'vitest/config.js';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // removed runner: 'node' — let Vitest use its default runner to avoid importing a module named "node"
    // runner: 'node',

    // Run tests in worker processes, not Vite browser or Vite SSR
    pool: 'forks',

    // Prevent Vite from transforming dependencies
    deps: {
      inline: [],
      external: [],
      interopDefault: false,
    },

    // Prevent Vite from scanning TS/JS modules
    isolate: true,
  },

  // Enable V8 native coverage collection
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov', 'html'],
    all: true,
    include: ['src/**/*.ts'],
    exclude: ['**/*.d.ts', 'tests/**', 'node_modules/**'],
    clean: true,
  },

  // Disable Vite resolve  
  resolve: {
    alias: {},
    preserveSymlinks: true,
    dedupe: [],
  },

  // Make sure Vite itself is NOT active
  optimizeDeps: {
    disabled: true,
  },
});
