import { IRule } from "./IRule.js";
import { ValidationResult } from "./ValidationResult.js";

export interface IRuleSet<T> {
  readonly rules: IRule<T>[];
  evaluate(model: T): ValidationResult;
}
