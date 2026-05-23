import type { SharedEdgeOrientation } from "./SharedEdgeOrientation.js";

export type GridNeighbour = Readonly<{
  readonly firstPatchId: string;
  readonly secondPatchId: string;
  readonly orientation: SharedEdgeOrientation;
}>;
