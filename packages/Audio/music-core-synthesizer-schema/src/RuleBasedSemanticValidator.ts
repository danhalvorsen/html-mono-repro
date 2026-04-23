import type { ISemanticValidator } from "./ISemanticValidator.js";
import { SemanticValidationError } from "./SemanticValidationError.js";

export interface ISemanticRuleEvaluationResult {
  readonly isSuccess: boolean;
  renderErrors(): readonly string[];
}

export interface ISemanticRuleSet<T> {
  evaluate(model: T): ISemanticRuleEvaluationResult;
}

export class RuleBasedSemanticValidator<T> implements ISemanticValidator<T> {
  public constructor(private readonly ruleSet: ISemanticRuleSet<T>) {}

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
