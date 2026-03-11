// packages/composite-tree-system/Tree/Samples/core-composite-tree-web-audio-sample/vite.config.ts

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const coreWebAudioDist = fileURLToPath(
  new URL("../core-composite-tree-web-audio/dist/index.js", import.meta.url)
);

const coreCompositeTreeAbstractDist = fileURLToPath(
  new URL("../../core-composite-tree-abstract/dist/index.js", import.meta.url)
);

const coreGraphDist = fileURLToPath(
  new URL("../../../../core-graph/dist/index.js", import.meta.url)
);

export default defineConfig({
  root,
  resolve: {
    alias: {
      "@monorepo/core-composite-tree-web-audio": coreWebAudioDist,
      "@monorepo/core-composite-tree-abstract": coreCompositeTreeAbstractDist,
      "@monorepo/core-graph": coreGraphDist
    },
    preserveSymlinks: true
  },
  server: {
    port: 5173
  },
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    target: "es2022",
    emptyOutDir: true
  }
});