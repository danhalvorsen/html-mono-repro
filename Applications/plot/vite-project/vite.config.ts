import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@monorepo/core-plot": path.resolve(
        __dirname,
        "../../../packages/core-plot/dist/index.js",
      ),
      "@monorepo/core-plot-curve": path.resolve(
        __dirname,
        "../../../packages/core-plot-curve/dist/index.js",
      ),
    },
  },
});
