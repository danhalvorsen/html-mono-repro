import type { BufferGeometry } from "three";
import type { IGridPatch } from "@monorepo/game-progressive-grid";
import type { GridPatchGeometryOptions } from "./GridPatchGeometryOptions.js";

export interface IGridPatchGeometryFactory {
  createGeometry(
    patch: IGridPatch,
    options?: GridPatchGeometryOptions,
  ): BufferGeometry;
}
