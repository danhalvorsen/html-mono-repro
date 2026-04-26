import type { ISpecification } from "@monorepo/core-specifications";

import type { OscillatorDefinition } from "../definitions/index.js";
import { OscillatorDefinitionSpecification } from "../specifications/index.js";

export interface IOscillatorDefinitionValidator {
  validate(definition: OscillatorDefinition): void;
}

export class OscillatorDefinitionValidator implements IOscillatorDefinitionValidator {
  public constructor(
    private readonly specification: ISpecification<OscillatorDefinition>,
  ) {}

  public static createDefault(): OscillatorDefinitionValidator {
    return new OscillatorDefinitionValidator(
      OscillatorDefinitionSpecification.valid(),
    );
  }

  public validate(definition: OscillatorDefinition): void {
    if (!this.specification.isSatisfiedBy(definition)) {
      throw new Error(`Oscillator definition is invalid for kind '${definition.kind}'.`);
    }
  }
}
