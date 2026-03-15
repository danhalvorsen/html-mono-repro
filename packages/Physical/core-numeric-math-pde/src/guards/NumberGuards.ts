// guards/NumberGuards.ts

export class NumberGuards {

  public static ensureFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be a finite number.`);
    }
  }

  public static ensurePositive(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be a finite number greater than zero.`);
    }
  }

  public static ensureNonNegative(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a finite number greater than or equal to zero.`);
    }
  }

  public static ensureInteger(value: number, name: string): void {
    if (!Number.isInteger(value)) {
      throw new Error(`${name} must be an integer.`);
    }
  }

  public static ensureNonNegativeInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`${name} must be a non-negative integer.`);
    }
  }

  public static ensureInRange(
    value: number,
    min: number,
    max: number,
    name: string
  ): void {
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new Error(`${name} must be between ${min} and ${max}.`);
    }
  }

}