export interface IInterpolator<T> {
  readonly start: T;
  readonly end: T;
  readonly current: T;
  readonly isComplete: boolean;

  evaluateAt(scalar: number): T;  // scalar ∈ [0, 1]
  advanceBy(delta: number): T;    // delta is normalized distance, not time
  reset(): void;
}
