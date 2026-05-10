import path from "node:path";
import { defineConfig } from "vite";

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
      "@monorepo/music-core-midi-streamer": path.resolve(
        __dirname,
        "../../../packages/Audio/music-core-midi-streamer/src/index.ts"
      ),
    },
  },
});
