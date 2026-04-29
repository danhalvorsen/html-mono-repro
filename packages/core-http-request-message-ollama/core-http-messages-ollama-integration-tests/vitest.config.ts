import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));
const moduleRoot = resolve(root, "..");

export default defineConfig({
  root,
  resolve: {
    alias: {
      "@monorepo/core-http-messages": resolve(moduleRoot, "core-http-messages/src/index.ts"),
      "@monorepo/core-http-message-factories": resolve(moduleRoot, "core-http-message-factories/src/index.ts"),
      "@monorepo/core-http-messages-http-client": resolve(moduleRoot, "core-http-messages-http-client/src/index.ts"),
      "@monorepo/core-http-messages-ollama": resolve(moduleRoot, "core-http-messages-ollama/src/index.ts")
    }
  },
  test: {
    include: ["tests/**/*.integration.test.ts"],
    testTimeout: 90_000,
    hookTimeout: 90_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["tests/**/*.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90
      }
    }
  }
});
