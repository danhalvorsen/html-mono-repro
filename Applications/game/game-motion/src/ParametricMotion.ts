import { Vector2 } from "@monorepo/core-math";
import type { IParametricMotion, KinematicPoint } from "./IParametricMotion.js";
import type { ParametricAxisExpressionOptions } from "./ParametricAxisExpressionOptions.js";
import type { ParametricMotionMathOptions } from "./ParametricMotionMathOptions.js";
import { PolynomialExpression } from "./PolynomialExpression.js";
import type { ScalarPolynomialExpressionOptions } from "./PolynomialTermOptions.js";

interface KinematicExpressionSegment {
  readonly startsAtSeconds: number;
  readonly coordinate: ParametricAxisExpressionOptions;
  readonly velocity: ParametricAxisExpressionOptions;
  readonly acceleration: ParametricAxisExpressionOptions;
}

export class ParametricMotion implements IParametricMotion {
  readonly #segments: readonly KinematicExpressionSegment[];

  public constructor(options: ParametricMotionMathOptions) {
    this.#validate(options);

    this.#segments = options.coordinateSegments.map((segment) => {
      const velocity = this.#deriveAxisExpression(segment.coordinate);
      const acceleration = this.#deriveAxisExpression(velocity);

      return {
        startsAtSeconds: segment.startsAtSeconds,
        coordinate: segment.coordinate,
        velocity,
        acceleration,
      };
    });
  }

  public evaluateAt(timeSeconds: number): KinematicPoint {
    if (!Number.isFinite(timeSeconds) || timeSeconds < 0) {
      throw new Error("timeSeconds must be finite and >= 0.");
    }

    const segment = this.#findSegment(timeSeconds);
    const localTimeSeconds = timeSeconds - segment.startsAtSeconds;

    return {
      timeSeconds,
      coordinate: this.#evaluateAxisExpression(segment.coordinate, localTimeSeconds),
      velocity: this.#evaluateAxisExpression(segment.velocity, localTimeSeconds),
      acceleration: this.#evaluateAxisExpression(segment.acceleration, localTimeSeconds),
    };
  }

  #deriveAxisExpression(
    expression: ParametricAxisExpressionOptions,
  ): ParametricAxisExpressionOptions {
    return {
      x: new PolynomialExpression(expression.x).derivative().terms,
      y: new PolynomialExpression(expression.y).derivative().terms,
    };
  }

  #evaluateAxisExpression(
    expression: ParametricAxisExpressionOptions,
    timeSeconds: number,
  ): Vector2 {
    return new Vector2(
      this.#evaluateScalarExpression(expression.x, timeSeconds),
      this.#evaluateScalarExpression(expression.y, timeSeconds),
    );
  }

  #evaluateScalarExpression(
    expression: ScalarPolynomialExpressionOptions,
    timeSeconds: number,
  ): number {
    return expression.reduce(
      (sum, [exponent, coefficient]) =>
        sum + coefficient * Math.pow(timeSeconds, exponent),
      0,
    );
  }

  #findSegment(timeSeconds: number): KinematicExpressionSegment {
    for (let index = this.#segments.length - 1; index >= 0; index--) {
      const segment = this.#segments[index];

      if (segment !== undefined && timeSeconds >= segment.startsAtSeconds) {
        return segment;
      }
    }

    const first = this.#segments[0];

    if (first === undefined) {
      throw new Error("ParametricMotion requires at least one coordinate segment.");
    }

    return first;
  }

  #validate(options: ParametricMotionMathOptions): void {
    const segments = options.coordinateSegments;

    if (segments.length === 0) {
      throw new Error("ParametricMotion requires at least one coordinate segment.");
    }

    const first = segments[0];

    if (first === undefined || first.startsAtSeconds !== 0) {
      throw new Error("first coordinate segment must start at 0 seconds.");
    }

    for (let index = 0; index < segments.length; index++) {
      const current = segments[index];

      if (current === undefined) {
        throw new Error("coordinate segment must exist.");
      }

      if (!Number.isFinite(current.startsAtSeconds) || current.startsAtSeconds < 0) {
        throw new Error("coordinate segment start time must be finite and >= 0.");
      }

      const previous = segments[index - 1];

      if (
        index > 0 &&
        previous !== undefined &&
        current.startsAtSeconds <= previous.startsAtSeconds
      ) {
        throw new Error("coordinate segments must be ordered by increasing start time.");
      }
    }
  }
}
