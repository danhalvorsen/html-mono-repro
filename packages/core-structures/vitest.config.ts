// packages/core.module.example/core.module.example.web/vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,

    // Vitest should typecheck tests with the test tsconfig
    tsconfig: "./tsconfig.test.json",

    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts"
    ],

    environment: "node"
  }
});