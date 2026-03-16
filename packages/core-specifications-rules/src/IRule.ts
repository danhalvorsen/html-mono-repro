import { ValidationResult } from "./ValidationResult.js";
 
export interface IRule<T> {
  readonly name: string;
  check(model: T): ValidationResult;
}