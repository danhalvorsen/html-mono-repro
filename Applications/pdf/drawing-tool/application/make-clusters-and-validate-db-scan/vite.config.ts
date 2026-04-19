import { defineConfig } from "vite";
import { viteBackendPlugin } from "./src/backend/viteBackendPlugin.js";

export default defineConfig({
    plugins: [
        viteBackendPlugin()
    ]
});
