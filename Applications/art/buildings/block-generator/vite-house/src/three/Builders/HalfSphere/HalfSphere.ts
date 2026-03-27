
export interface IHalfSphere {
  readonly radius: number;
  readonly segments: number;
} 

export class HalfSphere implements IHalfSphere {
  public constructor(
    public readonly radius: number,
    public readonly segments: number = 16,
  ) {
    if (!Number.isFinite(radius) || radius <= 0) {
      throw new Error("radius must be > 0");
    }

    if (!Number.isInteger(segments) || segments < 3) {
      throw new Error("segments >= 3");
    }

    Object.freeze(this);
  }
}