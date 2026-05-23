import type { GridPatchMeshOptions } from "./GridPatchMeshOptions.js";

export type ProgressiveGridGroupOptions = Readonly<{
  readonly name?: string;
  readonly patchMeshOptions?: GridPatchMeshOptions;
}>;
