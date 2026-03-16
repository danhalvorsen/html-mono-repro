import { ValidationResult } from "./ValidationResult.js";
 
export interface IValidator<T> {
  ValidationErr(model: T): ValidationResult;
}