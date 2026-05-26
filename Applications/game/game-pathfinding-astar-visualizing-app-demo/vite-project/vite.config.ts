import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    dedupe: ["lit", "lit-html", "lit-element", "@lit/reactive-element"],
  },
  server: {
    fs: {
      allow: [resolve(__dirname, ".."), resolve(__dirname, "../../..")],
    },
  },
});
