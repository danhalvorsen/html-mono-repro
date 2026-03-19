
// ============================================================================
// packages/math-core-gpu/src/common/Guard.ts
// ============================================================================

export class Guard {
  public static finite(value: number, name: string): number {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be a finite number.`);
    }

    return value;
  }

  public static nonNegative(value: number, name: string): number {
    Guard.finite(value, name);

    if (value < 0) {
      throw new Error(`${name} must be >= 0.`);
    }

    return value;
  }

  public static index(index: number, length: number, name: string): number {
    if (!Number.isInteger(index) || index < 0 || index >= length) {
      throw new RangeError(`${name} was out of range.`);
    }

    return index;
  }
}

