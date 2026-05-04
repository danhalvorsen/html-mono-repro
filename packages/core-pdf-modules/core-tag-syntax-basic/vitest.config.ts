import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-tag-syntax-abstract": fileURLToPath(
        new URL("../core-tag-syntax-abstract/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    globals: false,
    include: ["tests/**/*.test.ts"],
  },
});