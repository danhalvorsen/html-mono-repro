import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],

    pool: "threads",
    isolate: false,

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"]
    }
  },

  resolve: {
    preserveSymlinks: true
  }
});