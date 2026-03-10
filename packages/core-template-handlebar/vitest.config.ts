// packages/core-template-handlebar/vitest.config.ts

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-filesystem": fileURLToPath(
        new URL("../core-filesystem/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});