// ============================================================================
// FILE: src/three/Builders/Box/Box.ts
// ============================================================================

export interface IBox {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

export class Box implements IBox {
  public constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly depth: number,
  ) {
    if (!Number.isFinite(width) || width <= 0) {
      throw new Error("width must be > 0");
    }

    if (!Number.isFinite(height) || height <= 0) {
      throw new Error("height must be > 0");
    }

    if (!Number.isFinite(depth) || depth <= 0) {
      throw new Error("depth must be > 0");
    }

    Object.freeze(this);
  }
}