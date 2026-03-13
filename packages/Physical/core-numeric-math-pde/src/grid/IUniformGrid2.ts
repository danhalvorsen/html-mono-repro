import { Vector2 } from "@monorepo/core-math";
export interface IUniformGrid2 {
  readonly resolution: Vector2;
  readonly spacing: Vector2;
  readonly origin: Vector2;
  readonly extent: Vector2;

  readonly width: number;
  readonly height: number;

  isInside(i: number, j: number): boolean;
  coordinateAt(i: number, j: number): Vector2;
}
