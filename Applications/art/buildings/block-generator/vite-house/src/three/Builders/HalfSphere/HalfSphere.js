export class HalfSphere {
    radius;
    segments;
    constructor(radius, segments = 16) {
        this.radius = radius;
        this.segments = segments;
        if (!Number.isFinite(radius) || radius <= 0) {
            throw new Error("radius must be > 0");
        }
        if (!Number.isInteger(segments) || segments < 3) {
            throw new Error("segments >= 3");
        }
        Object.freeze(this);
    }
}
//# sourceMappingURL=HalfSphere.js.map