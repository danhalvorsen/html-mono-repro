import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/music-core-midi": fileURLToPath(
        new URL("../../../../../packages/Audio/music-core-midi/dist/index.js", import.meta.url),
      ),
      "@monorepo/music-core-midi-playback": fileURLToPath(
        new URL("../../../../../packages/Audio/music-core-midi-playback/dist/index.js", import.meta.url),
      ),
      "@monorepo/core-specifications": fileURLToPath(
        new URL("../../../../../packages/core-specifications/dist/index.js", import.meta.url),
      ),
    },
  },
});
