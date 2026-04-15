export class InterpolatedCurve {
    constructor(points, label, interpolationKind = "catmull-rom", stepsPerSegment = 24) {
        this.points = points;
        this.label = label;
        this.interpolationKind = interpolationKind;
        this.stepsPerSegment = stepsPerSegment;
    }
}
//# sourceMappingURL=interpolated-curve.js.map