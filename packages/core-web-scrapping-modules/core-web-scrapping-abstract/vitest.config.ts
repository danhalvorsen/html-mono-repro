// packages/core-web-scrapping-modules/core-web-scrapping-abstract/vitest.config.ts

import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-http-messages": resolve(
        __dirname,
        "../../core-http-request-message-ollama/core-http-messages/src/index.ts",
      ),
      "@monorepo/core-http-messages-http-client": resolve(
        __dirname,
        "../../core-http-request-message-ollama/core-http-messages-http-client/src/index.ts",
      ),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    isolate: false,
    pool: "threads",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});