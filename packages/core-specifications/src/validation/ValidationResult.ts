export class ValidationResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly errors: string[] = []
  ) {}

  static ok(): ValidationResult {
    return new ValidationResult(true);
  }

  static fail(message: string | string[]): ValidationResult {
    return new ValidationResult(false, Array.isArray(message) ? message : [message]);
  }

  merge(other: ValidationResult): ValidationResult {
    if (this.isSuccess && other.isSuccess) {
      return ValidationResult.ok();
    }
    return new ValidationResult(false, [...this.errors, ...other.errors]);
  }
}
