import { DomainError } from "./DomainError.js";
import { ErrorCode } from "./ErrorCode.js";

export abstract class Guard {
  public static integer(value: number, context: string): void {
    if (!Number.isInteger(value)) {
      throw new DomainError(ErrorCode.Integer, context);
    }
  }

  public static nonNegative(value: number, context: string): void {
    if (value < 0) {
      throw new DomainError(ErrorCode.NonNegative, context);
    }
  }

  public static positive(value: number, context: string): void {
    if (value <= 0) {
      throw new DomainError(ErrorCode.Positive, context);
    }
  }

  public static notBlank(value: string, context: string): void {
    if (value.trim().length === 0) {
      throw new DomainError(ErrorCode.Required, context);
    }
  }

  public static notNull<T>(value: T | null | undefined, context: string): T {
    if (value === null || value === undefined) {
      throw new DomainError(ErrorCode.Required, context);
    }
    return value;
  }
}
