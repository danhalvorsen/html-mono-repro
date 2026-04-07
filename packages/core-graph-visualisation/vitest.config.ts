// vitest.config.ts

import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-graph": resolve(__dirname, "../core-graph/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
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
