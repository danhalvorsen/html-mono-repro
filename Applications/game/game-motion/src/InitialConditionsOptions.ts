import type { Vector2 } from "@monorepo/core-math";

export interface InitialVelocityOptions {
  /**
   * v0 magnitude.
   */
  readonly speed: number;

  /**
   * Direction at v0.
   * Must already be normalized by the consuming vector library.
   */
  readonly normalizedDirection: Vector2;
}

export interface InitialConditionsOptions {
  /**
   * x0, y0.
   */
  readonly origin: Vector2;

  /**
   * v0.
   */
  readonly velocity: InitialVelocityOptions;
}
