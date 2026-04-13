import { RectSemantic } from "./RectSemantic.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";

type SemanticCoordinates = readonly [xFactor: -1 | 0 | 1, yFactor: -1 | 0 | 1];

export class RectSemanticRegistry {
  private static readonly coordinates = new Map<RectSemanticPoint, SemanticCoordinates>([
    [RectSemantic.Top.Left, [-1, +1]],
    [RectSemantic.Top.Mid, [0, +1]],
    [RectSemantic.Top.Right, [+1, +1]],
    [RectSemantic.Right.Start, [+1, +1]],
    [RectSemantic.Right.Mid, [+1, 0]],
    [RectSemantic.Right.End, [+1, -1]],
    [RectSemantic.Bottom.Left, [-1, -1]],
    [RectSemantic.Bottom.Mid, [0, -1]],
    [RectSemantic.Bottom.Right, [+1, -1]],
    [RectSemantic.Left.Start, [-1, +1]],
    [RectSemantic.Left.Mid, [-1, 0]],
    [RectSemantic.Left.End, [-1, -1]],
  ]);

  private static readonly opposite = new Map<RectSemanticPoint, RectSemanticPoint>([
    [RectSemantic.Top.Left, RectSemantic.Bottom.Left],
    [RectSemantic.Top.Mid, RectSemantic.Bottom.Mid],
    [RectSemantic.Top.Right, RectSemantic.Bottom.Right],
    [RectSemantic.Right.Start, RectSemantic.Left.Start],
    [RectSemantic.Right.Mid, RectSemantic.Left.Mid],
    [RectSemantic.Right.End, RectSemantic.Left.End],
    [RectSemantic.Bottom.Left, RectSemantic.Top.Left],
    [RectSemantic.Bottom.Mid, RectSemantic.Top.Mid],
    [RectSemantic.Bottom.Right, RectSemantic.Top.Right],
    [RectSemantic.Left.Start, RectSemantic.Right.Start],
    [RectSemantic.Left.Mid, RectSemantic.Right.Mid],
    [RectSemantic.Left.End, RectSemantic.Right.End],
  ]);

  public static isValid(point: unknown): point is RectSemanticPoint {
    return typeof point === "string" && this.coordinates.has(point as RectSemanticPoint);
  }

  public static getCoordinates(point: RectSemanticPoint): SemanticCoordinates {
    const value = this.coordinates.get(point);
    if (value === undefined) {
      throw new Error(`Unsupported semantic point: ${String(point)}`);
    }

    return value;
  }

  public static getOpposite(point: RectSemanticPoint): RectSemanticPoint {
    const value = this.opposite.get(point);
    if (value === undefined) {
      throw new Error(`Unsupported semantic point: ${String(point)}`);
    }

    return value;
  }
}
