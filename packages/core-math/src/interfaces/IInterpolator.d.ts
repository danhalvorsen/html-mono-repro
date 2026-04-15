export interface IInterpolator<T> {
    readonly start: T;
    readonly end: T;
    readonly current: T;
    readonly isComplete: boolean;
    evaluateAt(scalar: number): T;
    advanceBy(delta: number): T;
    reset(): void;
}
//# sourceMappingURL=IInterpolator.d.ts.map