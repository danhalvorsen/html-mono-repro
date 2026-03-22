import type { AABB2 } from "@monorepo/core-math";

export interface IPlacementContext {
    readonly source: AABB2;
    readonly target: AABB2;
}
