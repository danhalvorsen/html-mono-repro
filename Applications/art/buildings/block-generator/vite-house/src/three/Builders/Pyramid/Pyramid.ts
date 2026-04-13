// ============================================================================
// FILE: src/three/Builders/Pyramid/Pyramid.ts
// ============================================================================

export interface IPyramid {
  readonly radius: number;           // base radius (circumradius)
  readonly height: number;
  readonly radialSegments: number;   // >= 3
}

export class Pyramid implements IPyramid {
  public constructor(
    public readonly radius: number,
    public readonly height: number,
    public readonly radialSegments: number = 4,
  ) {
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