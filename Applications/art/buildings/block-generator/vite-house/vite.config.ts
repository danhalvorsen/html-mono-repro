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

function injectThreeApplicationImports(): string {
  return [
    `import { ResizeController } from "${fsImportPath(path.resolve(frameworkDistRoot, "ResizeController.js"))}";`,
    `import { OrbitCameraController } from "${fsImportPath(path.resolve(frameworkDistRoot, "camera/OrbitCameraController.js"))}";`,
    `import { ThreeCamera } from "${fsImportPath(path.resolve(frameworkDistRoot, "camera/ThreeCamera.js"))}";`,
    `import { ThreeHost } from "${fsImportPath(path.resolve(frameworkDistRoot, "host/ThreeHost.js"))}";`,
    `import { MaterialFactory } from "${fsImportPath(path.resolve(frameworkDistRoot, "Materials/MaterialFactory.js"))}";`,
    `import { RenderLoop } from "${fsImportPath(path.resolve(frameworkDistRoot, "renderer/RenderLoop.js"))}";`,
    `import { ThreeRenderer } from "${fsImportPath(path.resolve(frameworkDistRoot, "renderer/ThreeRenderer.js"))}";`,
    `import { SceneRenderer } from "./scene/SceneRenderer.ts";`,
    `import { SceneClock } from "./scene/SceneClock.ts";`,
    `import { SceneMenu } from "./scene/SceneMenu.ts";`,
    `import { ThreeScene } from "./scene/ThreeScene.ts";`,
    `import { BuildingPreviewScene } from "./scene/BuildingPreviewScene.ts";`,
    `import { FooBuilderPlaygroundScene } from "./scene/playgrounds/FooBuilder.Playground.Scene.ts";`,
    `import { WindowBuilderPlaygroundScene } from "./scene/playgrounds/WindowBuilder.Playground.Scene.ts";`,
    `import { TinyPrimitiveCompositionScene } from "./scene/playgrounds/compositions/simple/TinyPrimitiveCompositionScene.ts";`,
    `import { PlacementScene } from "./scene/playgrounds/Placement/Placement.Platground.Scene.ts";`,
    "",
  ].join("\n");
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
    {
      name: "inject-three-application-imports",
      enforce: "pre",
      transform(code, id) {
        if (normalizePath(id) !== normalizePath(threeApplicationPath)) {
          return null;
        }

        return {
          code: `${injectThreeApplicationImports()}${code}`,
          map: null,
        };
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
    ],
  },
});
