import { Vector3Gpu, EPSILON } from "@monorepo/core-math-gpu";
import { Box3 } from "./code.js";

// ============================================================================
// AABB3
// ============================================================================

export class Aabb3 extends Box3 {
  private readonly minValue: Vector3Gpu;
  private readonly maxValue: Vector3Gpu;

  public constructor(min: Vector3Gpu, max: Vector3Gpu) {
    Aabb3.validate(min, max);

    const minValue = min.clone();
    const maxValue = max.clone();

    const center = new Vector3Gpu(
      (minValue.x + maxValue.x) * 0.5,
      (minValue.y + maxValue.y) * 0.5,
      (minValue.z + maxValue.z) * 0.5
    );

    const halfSize = new Vector3Gpu(
      (maxValue.x - minValue.x) * 0.5,
      (maxValue.y - minValue.y) * 0.5,
      (maxValue.z - minValue.z) * 0.5
    );

    super(center, halfSize, Vector3Gpu.UnitX, Vector3Gpu.UnitY, Vector3Gpu.UnitZ);

    this.minValue = minValue;
    this.maxValue = maxValue;
  }

  public min(): Vector3Gpu {
    return this.minValue.clone();
  }

  public max(): Vector3Gpu {
    return this.maxValue.clone();
  }

  private static validate(min: Vector3Gpu, max: Vector3Gpu): void {
    if (max.x < min.x || max.y < min.y || max.z < min.z) {
      throw new Error("Aabb3 max must be greater than or equal to min.");
    }

    if (Math.abs(max.x - min.x) <= EPSILON ||
      Math.abs(max.y - min.y) <= EPSILON ||
      Math.abs(max.z - min.z) <= EPSILON) {
      throw new Error("Aabb3 dimensions must be greater than zero.");
    }
  }
}
