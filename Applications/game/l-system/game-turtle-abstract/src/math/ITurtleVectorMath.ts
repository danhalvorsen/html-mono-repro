import type { Vector3 } from "../vectors/Vector3.js";

export interface ITurtleVectorMath {
  add(left: Vector3, right: Vector3): Vector3;
  scale(vector: Vector3, scalar: number): Vector3;
  length(vector: Vector3): number;
  normalize(vector: Vector3): Vector3;
  cross(left: Vector3, right: Vector3): Vector3;
  rotateAroundAxis(vector: Vector3, axis: Vector3, degrees: number): Vector3;
  copyVector(vector: Vector3): Vector3;
}