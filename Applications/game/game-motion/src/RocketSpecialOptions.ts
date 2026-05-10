import type { Vector2 } from "@monorepo/core-math";
import type { ScalarPolynomialExpressionOptions } from "./PolynomialTermOptions.js";

export interface RocketThrustOptions {
  /**
   * Must already be normalized by the consuming vector library.
   */
  readonly normalizedDirection: Vector2;

  /**
   * Thrust force over local burn time.
   *
   * [[0, 240]]           => 240
   * [[1, -20], [0, 240]] => -20t + 240
   */
  readonly force: ScalarPolynomialExpressionOptions;
}

export interface RocketFuelOptions {
  readonly burnDurationSeconds: number;
}

export interface RocketSpecialOptions {
  readonly gravity: Vector2;
  readonly thrust: RocketThrustOptions;
  readonly fuel: RocketFuelOptions;
}
