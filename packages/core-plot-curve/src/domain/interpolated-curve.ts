export interface CurvePointLike {
  readonly x: number;
  readonly y: number;
}

export type InterpolationKind = "catmull-rom";

export class InterpolatedCurve<TPoint extends CurvePointLike = CurvePointLike> {
  public constructor(
    public readonly points: readonly TPoint[],
    public readonly label: string,
    public readonly interpolationKind: InterpolationKind = "catmull-rom",
    public readonly stepsPerSegment = 24,
  ) {}
}
