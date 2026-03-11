// packages/composite-tree-system/Tree/Samples/core-composite-tree-web-audio/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "integration",
          environment: "node",
          globals: true,
          include: ["tests/integration/**/*.test.ts"],
          isolate: false,
          pool: "threads"
        }
      }
    ]
  }
});