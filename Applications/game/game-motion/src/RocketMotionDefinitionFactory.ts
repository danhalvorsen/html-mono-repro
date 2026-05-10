import type { InitialConditionsOptions } from "./InitialConditionsOptions.js";
import type { MovableObjectDefinitionOptions } from "./MovableObjectDefinitionOptions.js";
import type { PhysicalBodyOptions } from "./PhysicalMovementDefinitionOptions.js";
import { PolynomialExpression } from "./PolynomialExpression.js";
import type { ScalarPolynomialExpressionOptions } from "./PolynomialTermOptions.js";
import type { RocketSpecialOptions } from "./RocketSpecialOptions.js";

export interface RocketMotionDefinitionFactoryInput<TStructureOptions> {
  readonly structure: TStructureOptions;
  readonly body: PhysicalBodyOptions;
  readonly initialConditions: InitialConditionsOptions;
  readonly special: RocketSpecialOptions;
}

export class RocketMotionDefinitionFactory {
  public create<TStructureOptions>(
    input: RocketMotionDefinitionFactoryInput<TStructureOptions>,
  ): MovableObjectDefinitionOptions<TStructureOptions, RocketSpecialOptions> {
    this.#validate(input);

    return {
      structure: input.structure,
      special: input.special,

      physical: {
        body: input.body,
        initialConditions: input.initialConditions,

        accelerationProfile: {
          accelerationSegments: [
            {
              startsAtSeconds: 0,
              acceleration: {
                x: this.#createBurnAccelerationAxis(
                  input.special.gravity.x,
                  input.special.thrust.normalizedDirection.x,
                  input.special.thrust.force,
                  input.body.mass,
                ),

                y: this.#createBurnAccelerationAxis(
                  input.special.gravity.y,
                  input.special.thrust.normalizedDirection.y,
                  input.special.thrust.force,
                  input.body.mass,
                ),
              },
            },
            {
              startsAtSeconds: input.special.fuel.burnDurationSeconds,
              acceleration: {
                x: [[0, input.special.gravity.x]],
                y: [[0, input.special.gravity.y]],
              },
            },
          ],
        },
      },
    };
  }

  #createBurnAccelerationAxis(
    gravityAxisAcceleration: number,
    thrustDirectionAxis: number,
    thrustForce: ScalarPolynomialExpressionOptions,
    mass: number,
  ): ScalarPolynomialExpressionOptions {
    const thrustAcceleration = new PolynomialExpression(thrustForce).scale(
      thrustDirectionAxis / mass,
    );

    return thrustAcceleration.addConstant(gravityAxisAcceleration).terms;
  }

  #validate<TStructureOptions>(
    input: RocketMotionDefinitionFactoryInput<TStructureOptions>,
  ): void {
    if (!Number.isFinite(input.body.mass) || input.body.mass <= 0) {
      throw new Error("body.mass must be finite and greater than zero.");
    }

    if (
      !Number.isFinite(input.special.fuel.burnDurationSeconds) ||
      input.special.fuel.burnDurationSeconds <= 0
    ) {
      throw new Error(
        "rocket fuel burnDurationSeconds must be finite and greater than zero.",
      );
    }
  }
}
