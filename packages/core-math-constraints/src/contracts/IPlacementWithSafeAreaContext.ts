// ====================================================================================
// FILE: packages/core-math-constraints/src/contracts/source/IPlacementWithSafeAreaContext.ts
// ====================================================================================

import type { BoundingBox2D } from "@monorepo/core-math";
import type { IPlacementContext } from "./IPlacementContext.js";

export interface IPlacementWithSafeAreaContext extends IPlacementContext {
  readonly safeArea: BoundingBox2D;
}