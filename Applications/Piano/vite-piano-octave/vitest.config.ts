import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.ts", "tests/**/*.spec.ts"],
    exclude: ["e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
