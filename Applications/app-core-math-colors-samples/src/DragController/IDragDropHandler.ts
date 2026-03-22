import type { Point } from "@monorepo/core-math";
import type { IDragSession } from "./DragSession.js";

export interface IDragDropHandler<TTarget> {
  resolveTarget(position: Point, event: PointerEvent): TTarget | null;

  onClick(target: TTarget, position: Point, event: MouseEvent): void;

  onDragStart(session: IDragSession<TTarget>, event: PointerEvent): void;
  onDragMove(session: IDragSession<TTarget>, event: PointerEvent): void;
  onDragEnd(session: IDragSession<TTarget>, event: PointerEvent): void;
}