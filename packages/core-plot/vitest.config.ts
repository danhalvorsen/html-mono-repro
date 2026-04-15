// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-plot-canvas": path.resolve(packageRoot, "../core-plot-canvas/src/index.ts"),
      "@monorepo/core-plot-curve": path.resolve(packageRoot, "../core-plot-curve/src/index.ts"),
      "@monorepo/core-plot-shapes": path.resolve(packageRoot, "../core-plot-shapes/src/index.ts"),
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
