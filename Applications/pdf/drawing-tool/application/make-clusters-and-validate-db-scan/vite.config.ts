import { defineConfig } from "vite";
import { viteBackendPlugin } from "./src/backend/viteBackendPlugin.js";

export default defineConfig({
    optimizeDeps: {
        exclude: [
            "lit",
            "@lit/reactive-element",
            "lit-element",
            "lit-html"
        ]
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true
            }
        }
    },
    plugins: [
        viteBackendPlugin()
    ]
});
