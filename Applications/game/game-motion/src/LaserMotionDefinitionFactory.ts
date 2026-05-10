import type { InitialConditionsOptions } from "./InitialConditionsOptions.js";
import type { LaserSpecialOptions } from "./LaserSpecialOptions.js";
import type { MovableObjectDefinitionOptions } from "./MovableObjectDefinitionOptions.js";
import type { PhysicalBodyOptions } from "./PhysicalMovementDefinitionOptions.js";

export interface LaserMotionDefinitionFactoryInput<TStructureOptions> {
  readonly structure: TStructureOptions;
  readonly body: PhysicalBodyOptions;
  readonly initialConditions: InitialConditionsOptions;
  readonly special: LaserSpecialOptions;
}

export class LaserMotionDefinitionFactory {
  public create<TStructureOptions>(
    input: LaserMotionDefinitionFactoryInput<TStructureOptions>,
  ): MovableObjectDefinitionOptions<TStructureOptions, LaserSpecialOptions> {
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
                x: [[0, 0]],
                y: [[0, 0]],
              },
            },
          ],
        },
      },
    };
  }
}
