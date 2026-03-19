// ============================================================================
// packages/math-core-gpu/src/contracts/IBoundingBoxGpu.ts
// ============================================================================

import { Vector2Gpu } from "../primitives/Vector2Gpu.js";

export interface IBoundingBoxGpu {
  readonly min: Vector2Gpu;
  readonly max: Vector2Gpu;

  width(): number;
  height(): number;
  center(): Vector2Gpu;
  contains(p: Vector2Gpu): boolean;
  intersects(other: IBoundingBoxGpu): boolean;
}
