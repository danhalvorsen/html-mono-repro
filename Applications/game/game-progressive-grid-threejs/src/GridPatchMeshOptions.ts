import type { Material } from "three";
import type { GridPatchGeometryOptions } from "./GridPatchGeometryOptions.js";

export type GridPatchMeshOptions = Readonly<{
  readonly geometryOptions?: GridPatchGeometryOptions;
  readonly material?: Material;
  readonly namePrefix?: string;
}>;
