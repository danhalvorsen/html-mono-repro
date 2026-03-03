import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    isolate: true,
    pool: "threads"
  },
  resolve: {
    alias: {
      // IMPORTANT: match the actual package name
      "@monorepo/fsm": path.resolve(__dirname, "./src/index.ts")
    },
    preserveSymlinks: true
  }
});