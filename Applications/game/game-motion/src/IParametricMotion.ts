import type { Vector2 } from "@monorepo/core-math";

export interface KinematicPoint {
  readonly timeSeconds: number;

  /**
   * Result of x(t), y(t).
   */
  readonly coordinate: Vector2;

  /**
   * Result of x'(t), y'(t).
   */
  readonly velocity: Vector2;

  /**
   * Result of x''(t), y''(t).
   */
  readonly acceleration: Vector2;
}

export interface IParametricMotion {
  evaluateAt(timeSeconds: number): KinematicPoint;
}
