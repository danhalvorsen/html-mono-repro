import { ValidationResult } from "./ValidationResult.js";

export interface IRule<T> {
  name: string;
  check(model: T): ValidationResult;
}