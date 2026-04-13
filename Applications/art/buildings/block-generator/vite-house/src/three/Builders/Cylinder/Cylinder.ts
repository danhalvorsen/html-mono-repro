// ============================================================================
// FILE: src/three/Builders/Cylinder/Cylinder.ts
// ============================================================================

export interface ICylinder {
  readonly radiusTop: number;
  readonly radiusBottom: number;
  readonly height: number;
  readonly radialSegments: number;
}

export class Cylinder implements ICylinder {
  public constructor(
    public readonly radiusTop: number,
    public readonly radiusBottom: number,
    public readonly height: number,
    public readonly radialSegments: number = 16,
  ) {
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
