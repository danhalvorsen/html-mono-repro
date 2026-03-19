import type { BoundingBox2D  } from "@monorepo/core-math";

export interface IPlacementContext {
    readonly source: BoundingBox2D; // object
    readonly target: BoundingBox2D; // wall OR valid placement area
}
