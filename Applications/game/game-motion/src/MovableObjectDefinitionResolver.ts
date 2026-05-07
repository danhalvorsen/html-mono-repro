import type {
  IParametricMotionFromAccelerationFactory,
} from "./ParametricMotionFromAccelerationFactory.js";
import { ParametricMotionFromAccelerationFactory } from "./ParametricMotionFromAccelerationFactory.js";
import type {
  MovableObjectDefinitionOptions,
  ResolvedMovableObjectOptions,
} from "./MovableObjectDefinitionOptions.js";

export interface IMovableObjectDefinitionResolver {
  resolve<TStructureOptions, TSpecialOptions>(
    definition: MovableObjectDefinitionOptions<TStructureOptions, TSpecialOptions>,
  ): ResolvedMovableObjectOptions<TStructureOptions, TSpecialOptions>;
}

export class MovableObjectDefinitionResolver
  implements IMovableObjectDefinitionResolver
{
  public constructor(
    private readonly motionFactory: IParametricMotionFromAccelerationFactory =
      new ParametricMotionFromAccelerationFactory(),
  ) {}

  public resolve<TStructureOptions, TSpecialOptions>(
    definition: MovableObjectDefinitionOptions<TStructureOptions, TSpecialOptions>,
  ): ResolvedMovableObjectOptions<TStructureOptions, TSpecialOptions> {
    return {
      structure: definition.structure,
      physical: definition.physical,
      special: definition.special,
      math: this.motionFactory.create(definition.physical),
    };
  }
}
