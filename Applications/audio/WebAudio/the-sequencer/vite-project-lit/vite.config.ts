import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-fsm": fileURLToPath(
        new URL("../../../../../packages/core-fsm/src/index.ts", import.meta.url),
      ),
      "@monorepo/core-specifications": fileURLToPath(
        new URL("../../../../../packages/core-specifications/src/index.ts", import.meta.url),
      ),
      "@monorepo/music-core-midi": fileURLToPath(
        new URL("../../../../../packages/Audio/music-core-midi/src/index.ts", import.meta.url),
      ),
      "@monorepo/music-core-midi-playback": fileURLToPath(
        new URL("../../../../../packages/Audio/music-core-midi-playback/src/index.ts", import.meta.url),
      ),
    },
  },
});
