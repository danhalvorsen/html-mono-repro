import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-graph-visualisation/lit": resolve(
        __dirname,
        "../../../packages/core-graph-visualisation/src/lit.ts",
      ),
      "@monorepo/core-graph-visualisation": resolve(
        __dirname,
        "../../../packages/core-graph-visualisation/src/index.ts",
      ),
      "@monorepo/core-graph": resolve(__dirname, "../../../packages/core-graph/src/index.ts"),
    },
  },
});
