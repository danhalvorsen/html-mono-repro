import type { Point } from "@monorepo/core-math";

export interface IDraggableTarget {
  hitTest(point: Point): boolean;

  onClick(point: Point): void;
  onDragStart(point: Point): void;
  onDragMove(point: Point): void;
  onDragEnd(point: Point): void;
}