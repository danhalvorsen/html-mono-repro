// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
    pool: "forks",
    isolate: true,
  },

  resolve: {
    preserveSymlinks: true,
    alias: {},
    dedupe: [],
  },

  optimizeDeps: {
    disabled: true,
  },
});