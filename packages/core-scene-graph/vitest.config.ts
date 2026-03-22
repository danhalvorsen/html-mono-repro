// packages/core-scene-graph/vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    name: "core-scene-graph",
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.d.ts",
      "**/tests/**/fixtures/**",
      "**/tests/**/helpers/**",
      "**/src/**/Sample/**",
      "**/src/**/Demo.ts",
      "**/src/**/main.ts",
    ],
    pool: "threads",
    isolate: false,
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
    coverage: {
      enabled: true,
      provider: "v8",
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/**/*.d.ts",
        "src/**/Sample/**",
        "src/**/Demo.ts",
        "src/**/main.ts",
      ],
      reporter: ["text", "text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: path.resolve(__dirname, "./coverage"),
      clean: true,
      cleanOnRerun: true,
      skipFull: false,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});