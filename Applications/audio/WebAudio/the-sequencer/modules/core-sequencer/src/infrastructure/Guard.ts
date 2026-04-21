import { DomainError } from "./DomainError.js";
import { ErrorCode } from "./ErrorCode.js";

export abstract class Guard {
  public static integer(value: number, context: string): number {
    if (!Number.isInteger(value)) {
      throw new DomainError(ErrorCode.Integer, context);
    }

    return value;
  }

  public static nonNegative(value: number, context: string): number {
    if (value < 0) {
      throw new DomainError(ErrorCode.NonNegative, context);
    }

    return value;
  }

  public static positive(value: number, context: string): number {
    if (value <= 0) {
      throw new DomainError(ErrorCode.Positive, context);
    }

    return value;
  }

  public static positiveInteger(value: number, context: string): number {
    Guard.integer(value, context);
    Guard.positive(value, context);
    return value;
  }

  public static notBlank(value: string, context: string): string {
    if (value.trim().length === 0) {
      throw new DomainError(ErrorCode.Required, context);
    }

    return value;
  }

  public static notNull<T>(value: T | null | undefined, context: string): T {
    if (value === null || value === undefined) {
      throw new DomainError(ErrorCode.Required, context);
    }
    return value;
  }
}
