import type { ParametricMotionMathOptions } from "./ParametricMotionMathOptions.js";
import type { PhysicalMovementDefinitionOptions } from "./PhysicalMovementDefinitionOptions.js";

export interface MovableObjectDefinitionOptions<TStructureOptions, TSpecialOptions> {
  readonly structure: TStructureOptions;
  readonly physical: PhysicalMovementDefinitionOptions;
  readonly special: TSpecialOptions;
}

export interface ResolvedMovableObjectOptions<TStructureOptions, TSpecialOptions> {
  readonly structure: TStructureOptions;
  readonly physical: PhysicalMovementDefinitionOptions;
  readonly special: TSpecialOptions;

  /**
   * Generated x(t), y(t).
   */
  readonly math: ParametricMotionMathOptions;
}
