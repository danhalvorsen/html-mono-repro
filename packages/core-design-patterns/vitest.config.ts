// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    pool: "forks",
    isolate: true,

    // If you need to inline workspace packages (common in monorepos),
    // add them here; otherwise omit deps entirely.
    // deps: { inline: [/^@monorepo\//] },
  },

  resolve: {
    preserveSymlinks: true,
    alias: {},
    dedupe: [],
  },

  // For node-environment unit/integration tests, Vite prebundling is unnecessary.
  optimizeDeps: {
    disabled: true,
  },
});