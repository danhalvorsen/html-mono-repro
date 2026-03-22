// Applications/app-core-math-colors-samples/src/Gradient/DragController/DragSession.ts

import type { Point } from "@monorepo/core-math";

export interface IDragSession<TTarget> {
  readonly target: TTarget;
  readonly origin: Point;
  readonly current: Point;
}

export class DragSession<TTarget> implements IDragSession<TTarget> {
  public constructor(
    public readonly target: TTarget,
    public readonly origin: Point,
    public readonly current: Point,
  ) {}

  public moveTo(position: Point): DragSession<TTarget> {
    return new DragSession(this.target, this.origin, position);
  }
}