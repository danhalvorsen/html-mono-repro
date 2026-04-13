// ============================================================================
// FILE: src/three/Builders/Sphere/Sphere.ts
// ============================================================================

export interface ISphere {
  readonly radius: number;
  readonly widthSegments: number;
  readonly heightSegments: number;
}

export class Sphere implements ISphere {
  public constructor(
    public readonly radius: number,
    public readonly widthSegments: number = 16,
    public readonly heightSegments: number = 12,
  ) {
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