import { Point } from "@monorepo/core-math";

// ============================================================================
// src/Pipeline/ThePipeline.ts
// ============================================================================

export interface IHitTestable {
    containsPoint(point: Point): boolean;
}
