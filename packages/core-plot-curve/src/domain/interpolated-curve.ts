import type { Point2 } from "@monorepo/core-math";

export type CurvePointLike = Point2;

export type InterpolationKind = "catmull-rom";

export class InterpolatedCurve<TPoint extends CurvePointLike = CurvePointLike> {
  public constructor(
    public readonly points: readonly TPoint[],
    public readonly label: string,
    public readonly interpolationKind: InterpolationKind = "catmull-rom",
    public readonly stepsPerSegment = 24,
  ) {}
}
