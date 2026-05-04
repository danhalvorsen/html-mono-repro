// packages/core-pdf-reader-app/pdf-demo-app/vite.config.ts

import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        pdfViewer: resolve(__dirname, "pdf-viewer.html"),
      },
    },
  },
});