export interface CurvePointLike {
    readonly x: number;
    readonly y: number;
}
export type InterpolationKind = "catmull-rom";
export declare class InterpolatedCurve<TPoint extends CurvePointLike = CurvePointLike> {
    readonly points: readonly TPoint[];
    readonly label: string;
    readonly interpolationKind: InterpolationKind;
    readonly stepsPerSegment: number;
    constructor(points: readonly TPoint[], label: string, interpolationKind?: InterpolationKind, stepsPerSegment?: number);
}
//# sourceMappingURL=interpolated-curve.d.ts.map