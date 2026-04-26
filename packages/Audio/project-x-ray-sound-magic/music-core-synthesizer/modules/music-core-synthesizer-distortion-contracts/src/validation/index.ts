import type { ISpecification } from "@monorepo/core-specifications";

import type { DistortionDefinition } from "../definitions/index.js";
import { DistortionDefinitionSpecification } from "../specifications/index.js";

export interface IDistortionDefinitionValidator {
  validate(definition: DistortionDefinition): void;
}

export class DistortionDefinitionValidator implements IDistortionDefinitionValidator {
  public constructor(
    private readonly specification: ISpecification<DistortionDefinition>,
  ) {}

  public static createDefault(): DistortionDefinitionValidator {
    return new DistortionDefinitionValidator(
      DistortionDefinitionSpecification.valid(),
    );
  }

  public validate(definition: DistortionDefinition): void {
    if (!this.specification.isSatisfiedBy(definition)) {
      throw new Error(`Distortion definition is invalid for kind '${definition.kind}'.`);
    }
  }
}
