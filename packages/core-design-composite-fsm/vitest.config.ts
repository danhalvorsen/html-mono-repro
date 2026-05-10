import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
    ],
    isolate: false,
    pool: "threads",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
