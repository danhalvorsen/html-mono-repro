import type { IRuleSet } from "@monorepo/core-specifications-rules";

import type { ISemanticValidator } from "./ISemanticValidator.js";
import { SemanticValidationError } from "./SemanticValidationError.js";

export class RuleBasedSemanticValidator<T> implements ISemanticValidator<T> {
  public constructor(private readonly ruleSet: IRuleSet<T>) {}

  public validate(model: T): T {
    const result = this.ruleSet.evaluate(model);

    if (!result.isSuccess) {
      throw new SemanticValidationError(
        "Semantic validation failed.",
        result.renderErrors(),
      );
    }

    return model;
  }
}
