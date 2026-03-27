// ============================================================================
// FILE: src/three/Builders/Quad/src/IRectBuilderInternal.ts
// FIX: missing imports
// ============================================================================

import type { RectBuilder } from "./RectBuilder.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export interface IRectBuilderInternal {
  addPointPlacement(point: RectSemanticPoint): RectBuilder;
}