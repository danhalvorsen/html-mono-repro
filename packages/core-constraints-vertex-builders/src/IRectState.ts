import type { IRectSize } from "./IRectSize.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

export interface IRectState {
  readonly centerX: number;
  readonly centerY: number;
  readonly centerZ: number;
  readonly size: IRectSize;
  readonly rotationDegrees: number;
  readonly pivot: RectSemanticPoint | undefined;
}
