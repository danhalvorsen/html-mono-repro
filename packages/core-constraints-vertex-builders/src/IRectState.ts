// ============================================================================
// FILE: src/three/Builders/Quad/src/IRectState.ts
// FIX: missing import
// ============================================================================

import type { IRectSize } from "./IRectSize.js";
import type { RectMode } from "./RectMode.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export interface IRectState {
  readonly centerX: number;
  readonly centerY: number;
  readonly centerZ: number;
  readonly size: IRectSize;
  readonly rotationDegrees: number;
  readonly mode: RectMode;
  readonly pivot?: RectSemanticPoint;
}