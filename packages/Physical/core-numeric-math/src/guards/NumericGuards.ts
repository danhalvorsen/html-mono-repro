export class NumericGuards {
  public static ensureFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be finite.`);
    }
  }

  public static ensurePositive(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be a finite number greater than zero.`);
    }
  }

  public static ensureNonNegativeInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`${name} must be a non-negative integer.`);
    }
  }
}