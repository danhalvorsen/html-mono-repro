import { ValidationResult } from "./ValidationResult.js";

export interface IValidator<T> {
  validate(model: T): ValidationResult;
}
