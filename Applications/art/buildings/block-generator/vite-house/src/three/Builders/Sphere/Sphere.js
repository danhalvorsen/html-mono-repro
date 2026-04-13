// ============================================================================
// FILE: src/three/Builders/Sphere/Sphere.ts
// ============================================================================
export class Sphere {
    radius;
    widthSegments;
    heightSegments;
    constructor(radius, widthSegments = 16, heightSegments = 12) {
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        if (!Number.isFinite(radius) || radius <= 0) {
            throw new Error("radius must be > 0");
        }
        if (!Number.isInteger(widthSegments) || widthSegments < 3) {
            throw new Error("widthSegments >= 3");
        }
        if (!Number.isInteger(heightSegments) || heightSegments < 2) {
            throw new Error("heightSegments >= 2");
        }
        Object.freeze(this);
    }
}
//# sourceMappingURL=Sphere.js.map