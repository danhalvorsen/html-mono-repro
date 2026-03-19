import type { AABB2 } from "@monorepo/core-math";


export interface IObjectPlacementContext {
    readonly objectRect: AABB2;
    readonly wallRect: AABB2;
}
