// ============================================================================
// FILE: src/three/Builders/Cylinder/Cylinder.ts
// ============================================================================
export class Cylinder {
    radiusTop;
    radiusBottom;
    height;
    radialSegments;
    constructor(radiusTop, radiusBottom, height, radialSegments = 16) {
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        if (!Number.isFinite(radiusTop) || radiusTop < 0) {
            throw new Error("radiusTop must be >= 0");
        }
        if (!Number.isFinite(radiusBottom) || radiusBottom < 0) {
            throw new Error("radiusBottom must be >= 0");
        }
        if (radiusTop === 0 && radiusBottom === 0) {
            throw new Error("at least one radius must be > 0");
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
//# sourceMappingURL=Cylinder.js.map