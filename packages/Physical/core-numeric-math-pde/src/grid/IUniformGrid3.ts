import { Vector2, Vector3 } from "@monorepo/core-math";

export interface IUniformGrid3 {
  readonly resolution: Vector3;
  readonly spacing: Vector3;
  readonly origin: Vector3;
  readonly extent: Vector3;

  readonly width: number;
  readonly height: number;
  readonly depth: number;

  isInside(i: number, j: number, k: number): boolean;
  coordinateAt(i: number, j: number, k: number): Vector3;
}
