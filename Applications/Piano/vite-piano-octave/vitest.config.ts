import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/music-core-midi": path.resolve(
        __dirname,
        "../../../packages/Audio/music-core-midi/src/index.ts"
      ),
      "@monorepo/music-core-midi-playback": path.resolve(
        __dirname,
        "../../../packages/Audio/music-core-midi-playback/src/index.ts"
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.ts", "tests/**/*.spec.ts"],
    exclude: ["e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
