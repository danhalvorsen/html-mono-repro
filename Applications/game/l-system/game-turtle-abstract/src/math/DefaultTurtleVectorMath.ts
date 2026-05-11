import { InvalidRotationError } from "../errors/InvalidRotationError.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type { ITurtleVectorMath } from "./ITurtleVectorMath.js";

export class DefaultTurtleVectorMath implements ITurtleVectorMath {
  public add(left: Vector3, right: Vector3): Vector3 {
    return this.copyVector({
      x: left.x + right.x,
      y: left.y + right.y,
      z: left.z + right.z,
    });
  }

  public scale(vector: Vector3, scalar: number): Vector3 {
    return this.copyVector({
      x: vector.x * scalar,
      y: vector.y * scalar,
      z: vector.z * scalar,
    });
  }

  public length(vector: Vector3): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }

  public normalize(vector: Vector3): Vector3 {
    const length = this.length(vector);

    if (length === 0) {
      throw new InvalidRotationError("Cannot normalize a zero-length vector.");
    }

    return this.copyVector({
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length,
    });
  }

  public cross(left: Vector3, right: Vector3): Vector3 {
    return this.copyVector({
      x: left.y * right.z - left.z * right.y,
      y: left.z * right.x - left.x * right.z,
      z: left.x * right.y - left.y * right.x,
    });
  }

  public rotateAroundAxis(vector: Vector3, axis: Vector3, degrees: number): Vector3 {
    if (!Number.isFinite(degrees)) {
      throw new InvalidRotationError("Rotation degrees must be finite.");
    }

    const unitAxis = this.normalize(axis);
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const axisDotVector =
      unitAxis.x * vector.x +
      unitAxis.y * vector.y +
      unitAxis.z * vector.z;

    const axisCrossVector = this.cross(unitAxis, vector);

    return this.copyVector({
      x:
        vector.x * cos +
        axisCrossVector.x * sin +
        unitAxis.x * axisDotVector * (1 - cos),
      y:
        vector.y * cos +
        axisCrossVector.y * sin +
        unitAxis.y * axisDotVector * (1 - cos),
      z:
        vector.z * cos +
        axisCrossVector.z * sin +
        unitAxis.z * axisDotVector * (1 - cos),
    });
  }

  public copyVector(vector: Vector3): Vector3 {
    return Object.freeze({
      x: this.normalizeZero(vector.x),
      y: this.normalizeZero(vector.y),
      z: this.normalizeZero(vector.z),
    });
  }

  private normalizeZero(value: number): number {
    return Object.is(value, -0) || Math.abs(value) < 1e-12 ? 0 : value;
  }
}