import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/lit-code-editor/",
  resolve: {
    alias: {
      "@monorepo/core-pdf-presenter": resolve(
        __dirname,
        "../core-pdf-presenter/src/index.ts",
      ),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        editor: resolve(__dirname, "editor.html"),
        jsonView: resolve(__dirname, "json-view.html"),
        readonlyView: resolve(__dirname, "readonly-view.html"),
      },
    },
  },
});
