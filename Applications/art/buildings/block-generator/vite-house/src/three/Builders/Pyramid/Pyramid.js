// ============================================================================
// FILE: src/three/Builders/Pyramid/Pyramid.ts
// ============================================================================
export class Pyramid {
    radius;
    height;
    radialSegments;
    constructor(radius, height, radialSegments = 4) {
        this.radius = radius;
        this.height = height;
        this.radialSegments = radialSegments;
        if (!Number.isFinite(radius) || radius <= 0) {
            throw new Error("radius must be > 0");
        }
        if (!Number.isFinite(height) || height <= 0) {
            throw new Error("height must be > 0");
        }
        if (!Number.isInteger(radialSegments) || radialSegments < 3) {
            throw new Error("radialSegments >= 3");
        }
        Object.freeze(this);
    }
}
//# sourceMappingURL=Pyramid.js.map