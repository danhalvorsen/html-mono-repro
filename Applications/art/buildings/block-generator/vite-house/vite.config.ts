import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, normalizePath } from "vite";

const appRoot = fileURLToPath(new URL(".", import.meta.url));
const frameworkDistRoot = path.resolve(
  appRoot,
  "../../../../../packages/core-threejs-app-framework/dist",
);
const threeApplicationPath = path.resolve(appRoot, "src/three/ThreeApplication.ts");

function fsImportPath(targetPath: string): string {
  return `/@fs/${normalizePath(targetPath)}`;
}

export default defineConfig({
  plugins: [
    {
      name: "resolve-legacy-framework-imports",
      enforce: "pre",
      resolveId(source) {
        if (
          source ===
          "../core-threejs-app-framework/src/application/ThreeApplication.js"
        ) {
          return threeApplicationPath;
        }

        if (source === "@monorepo/core-threejs-app-framework") {
          return path.resolve(frameworkDistRoot, "Materials/MaterialToken.js");
        }

        if (source.startsWith("@monorepo/core-threejs-app-framework/src/")) {
          const relativeFrameworkPath = source.replace(
            "@monorepo/core-threejs-app-framework/src/",
            "",
          );

          return path.resolve(frameworkDistRoot, relativeFrameworkPath);
        }

        if (/^(?:\.\.\/)+core-threejs-app-framework\/src\//.test(source)) {
          const relativeFrameworkPath = source.replace(
            /^(?:\.\.\/)+core-threejs-app-framework\/src\//,
            "",
          );

          return path.resolve(frameworkDistRoot, relativeFrameworkPath);
        }

        return null;
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: "../core-threejs-app-framework/src/application/ThreeApplication.js",
        replacement: threeApplicationPath,
      },
      {
        find: /^(?:\.\.\/)+core-threejs-app-framework\/src\//,
        replacement: `${frameworkDistRoot}/`,
      },
      {
        find: "@monorepo/core-threejs-app-framework/src/",
        replacement: `${frameworkDistRoot}/`,
      },
    ],
  },
});
