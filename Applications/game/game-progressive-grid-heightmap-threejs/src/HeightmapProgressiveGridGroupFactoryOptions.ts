import type { GridPatchMeshOptions } from "@monorepo/game-progressive-grid-threejs/src/index.js";
import type { ImageHeightmapProjectorOptions } from "./ImageHeightmapProjectorOptions.js";
import type { RgbaHeightSamplerOptions } from "./RgbaHeightSamplerOptions.js";

export type HeightmapProgressiveGridGroupFactoryOptions = Readonly<{
  readonly name?: string;
  readonly patchMeshOptions?: GridPatchMeshOptions;
  readonly projectorOptions?: ImageHeightmapProjectorOptions;
  readonly samplerOptions?: RgbaHeightSamplerOptions;
}>;
