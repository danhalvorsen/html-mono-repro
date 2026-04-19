export function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
}

export function assertPositive(value: number, name: string): void {
  assertFinite(value, name);

  if (value <= 0) {
    throw new Error(`${name} must be > 0`);
  }
}

export function assertNonNegative(value: number, name: string): void {
  assertFinite(value, name);

  if (value < 0) {
    throw new Error(`${name} must be >= 0`);
  }
}
