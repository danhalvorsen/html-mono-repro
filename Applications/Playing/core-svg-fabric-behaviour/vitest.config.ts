// vitest.config.ts

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-style-system": resolve(
        packageRoot,
        "../../../packages/core-style-system/src/index.ts",
      ),
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
