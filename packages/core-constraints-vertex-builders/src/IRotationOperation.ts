// ============================================================================
// FILE: src/three/Builders/Quad/src/IRotationOperation.ts
// FIX: missing import
// ============================================================================

import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export interface IRotationOperation {
  readonly kind: "Rotation";
  readonly pivot: RectSemanticPoint;
  readonly angleDegrees: number;
}