import { Vector2 } from "@monorepo/core-math";
import type { AccelerationSegmentOptions } from "./AccelerationProfileOptions.js";
import type {
  IInitialVelocityResolver,
} from "./InitialVelocityResolver.js";
import { InitialVelocityResolver } from "./InitialVelocityResolver.js";
import type { ParametricMotionMathOptions } from "./ParametricMotionMathOptions.js";
import type { PhysicalMovementDefinitionOptions } from "./PhysicalMovementDefinitionOptions.js";
import { PolynomialExpression } from "./PolynomialExpression.js";
import type { ScalarPolynomialExpressionOptions } from "./PolynomialTermOptions.js";

interface SegmentEnd {
  readonly coordinate: Vector2;
  readonly velocity: Vector2;
}

interface CoordinateSegmentResult {
  readonly startsAtSeconds: number;
  readonly coordinate: {
    readonly x: ScalarPolynomialExpressionOptions;
    readonly y: ScalarPolynomialExpressionOptions;
  };
}

export interface IParametricMotionFromAccelerationFactory {
  create(physical: PhysicalMovementDefinitionOptions): ParametricMotionMathOptions;
}

export class ParametricMotionFromAccelerationFactory
  implements IParametricMotionFromAccelerationFactory
{
  public constructor(
    private readonly initialVelocityResolver: IInitialVelocityResolver =
      new InitialVelocityResolver(),
  ) {}

  public create(
    physical: PhysicalMovementDefinitionOptions,
  ): ParametricMotionMathOptions {
    this.#validatePhysical(physical);

    const accelerationSegments = physical.accelerationProfile.accelerationSegments;

    let currentOrigin = physical.initialConditions.origin;
    let currentVelocity = this.initialVelocityResolver.resolve(
      physical.initialConditions.velocity,
    );

    const coordinateSegments = accelerationSegments.map(
      (segment: AccelerationSegmentOptions, index: number) => {
        const coordinateSegment = this.#createCoordinateSegment(
          segment,
          currentOrigin,
          currentVelocity,
        );

        const nextSegment = accelerationSegments[index + 1];

        if (nextSegment !== undefined) {
          const durationSeconds =
            nextSegment.startsAtSeconds - segment.startsAtSeconds;

          const segmentEnd = this.#evaluateSegmentEnd(
            coordinateSegment.coordinate.x,
            coordinateSegment.coordinate.y,
            durationSeconds,
          );

          currentOrigin = segmentEnd.coordinate;
          currentVelocity = segmentEnd.velocity;
        }

        return coordinateSegment;
      },
    );

    return { coordinateSegments };
  }

  #createCoordinateSegment(
    accelerationSegment: AccelerationSegmentOptions,
    origin: Vector2,
    initialVelocity: Vector2,
  ): CoordinateSegmentResult {
    const ax = new PolynomialExpression(accelerationSegment.acceleration.x);
    const ay = new PolynomialExpression(accelerationSegment.acceleration.y);

    const vx = ax.integrate(initialVelocity.x);
    const vy = ay.integrate(initialVelocity.y);

    const x = vx.integrate(origin.x);
    const y = vy.integrate(origin.y);

    return {
      startsAtSeconds: accelerationSegment.startsAtSeconds,
      coordinate: {
        x: x.terms,
        y: y.terms,
      },
    };
  }

  #evaluateSegmentEnd(
    xTerms: ScalarPolynomialExpressionOptions,
    yTerms: ScalarPolynomialExpressionOptions,
    durationSeconds: number,
  ): SegmentEnd {
    const x = new PolynomialExpression(xTerms);
    const y = new PolynomialExpression(yTerms);

    const dx = x.derivative();
    const dy = y.derivative();

    return {
      coordinate: new Vector2(
        x.evaluateAt(durationSeconds),
        y.evaluateAt(durationSeconds),
      ),
      velocity: new Vector2(
        dx.evaluateAt(durationSeconds),
        dy.evaluateAt(durationSeconds),
      ),
    };
  }

  #validatePhysical(physical: PhysicalMovementDefinitionOptions): void {
    if (!Number.isFinite(physical.body.mass) || physical.body.mass <= 0) {
      throw new Error("physical.body.mass must be finite and greater than zero.");
    }

    const segments = physical.accelerationProfile.accelerationSegments;

    if (segments.length === 0) {
      throw new Error("accelerationProfile requires at least one segment.");
    }

    const first = segments[0];

    if (first === undefined || first.startsAtSeconds !== 0) {
      throw new Error("first acceleration segment must start at 0 seconds.");
    }

    for (let index = 0; index < segments.length; index++) {
      const current = segments[index];

      if (current === undefined) {
        throw new Error("acceleration segment must exist.");
      }

      if (
        !Number.isFinite(current.startsAtSeconds) ||
        current.startsAtSeconds < 0
      ) {
        throw new Error("acceleration segment start time must be finite and >= 0.");
      }

      const previous = segments[index - 1];

      if (
        index > 0 &&
        previous !== undefined &&
        current.startsAtSeconds <= previous.startsAtSeconds
      ) {
        throw new Error("acceleration segments must be ordered by increasing start time.");
      }
    }
  }
}
