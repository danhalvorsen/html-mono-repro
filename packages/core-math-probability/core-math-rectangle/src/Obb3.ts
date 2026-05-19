import { Matrix4Gpu, Vector3Gpu } from "@monorepo/core-math-gpu";
import { Box3 } from "./Box3.js";

// ============================================================================
// OBB3
// ============================================================================

export class Obb3 extends Box3 {
  private readonly orientationValue: Matrix4Gpu;

  public constructor(
    center: Vector3Gpu,
    halfSize: Vector3Gpu,
    orientation: Matrix4Gpu = Matrix4Gpu.identity()
  ) {
    const orientationValue = orientation.clone();
    const [axisX, axisY, axisZ] = Box3.createAxesFromOrientation(orientationValue);

    super(center, halfSize, axisX, axisY, axisZ);

    this.orientationValue = orientationValue;
  }

  public orientation(): Matrix4Gpu {
    return this.orientationValue.clone();
  }
}
