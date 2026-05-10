import type { BoundingBox2D, Line, Vector2 } from "@monorepo/core-math";

export class PolygonSegment {
  public readonly index: number;
  public readonly line: Line<Vector2>;
  public readonly bounds: BoundingBox2D;

  public constructor(index: number, line: Line<Vector2>, bounds: BoundingBox2D) {
    this.index = index;
    this.line = line;
    this.bounds = bounds;
  }
}
