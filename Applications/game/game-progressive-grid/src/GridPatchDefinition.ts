import type { GridPatchBounds } from "./GridPatchBounds.js";
import type { GridPatchResolution } from "./GridPatchResolution.js";

export type GridPatchDefinition = Readonly<{
  readonly id: string;
  readonly bounds: GridPatchBounds;
  readonly resolution: GridPatchResolution;
}>;
