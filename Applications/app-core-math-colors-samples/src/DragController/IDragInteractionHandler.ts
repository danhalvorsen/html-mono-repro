// Applications/app-core-math-colors-samples/src/Gradient/DragController/IDragInteractionHandler.ts

import type { Point } from "@monorepo/core-math";

export interface IDragInteractionHandler<TTarget> {
  onClick(target: TTarget, position: Point): void;
  onDragStart(target: TTarget, position: Point): void;
  onDragMove(target: TTarget, position: Point): void;
  onDragEnd(target: TTarget, position: Point): void;
}