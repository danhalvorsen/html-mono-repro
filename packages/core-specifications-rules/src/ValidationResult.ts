// packages/core-specifications-rules/src/ValidationResult.ts

import type { IValidationMessage } from "./IValidationMessage.js";

export class ValidationResult {
  public readonly isSuccess: boolean;
  public readonly errors: readonly IValidationMessage<object>[];

  public constructor(
    isSuccess: boolean,
    errors: readonly IValidationMessage<object>[] = [],
  ) {
    this.isSuccess = isSuccess;
    this.errors = errors;
  }

  public static ok(): ValidationResult {
    return new ValidationResult(true, []);
  }

  public static fail(
    error: IValidationMessage<object> | readonly IValidationMessage<object>[],
  ): ValidationResult {
    return new ValidationResult(false, Array.isArray(error) ? error : [error]);
  }

  public merge(other: ValidationResult): ValidationResult {
    if (this.isSuccess && other.isSuccess) {
      return ValidationResult.ok();
    }

    return new ValidationResult(false, [...this.errors, ...other.errors]);
  }

  public renderErrors(): string[] {
    return this.errors.map((error) => error.render());
  }
}