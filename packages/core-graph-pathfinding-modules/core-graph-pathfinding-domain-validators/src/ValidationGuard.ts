// packages/core-graph-pathfinding-domain-validators/src/ValidationGuard.ts
export class ValidationGuard {
  public static againstNullOrUndefined<T>(value: T | null | undefined, name: string): T {
    if (value === null || value === undefined) {
      throw new Error(`${name} cannot be null or undefined.`);
    }

    return value;
  }

  public static againstNullOrWhiteSpace(value: string, name: string): string {
    ValidationGuard.againstNullOrUndefined(value, name);

    if (value.trim().length === 0) {
      throw new Error(`${name} cannot be empty or whitespace.`);
    }

    return value;
  }

  public static againstInvalidNumber(value: number, name: string): number {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be a finite number.`);
    }

    return value;
  }

  public static againstNegative(value: number, name: string): number {
    if (value < 0) {
      throw new Error(`${name} cannot be negative.`);
    }

    return value;
  }
}