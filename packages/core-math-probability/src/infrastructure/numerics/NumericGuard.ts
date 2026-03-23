// =====================================================================================
// INFRA — NUMERICS
// =====================================================================================

export class NumericGuard {
    public static finite(value: number, name: string): void {
        if (!Number.isFinite(value)) {
            throw new RangeError(`${name} must be finite.`);
        }
    }

    public static positive(value: number, name: string): void {
        if (!Number.isFinite(value) || value <= 0) {
            throw new RangeError(`${name} must be > 0.`);
        }
    }

    public static probability(value: number, name: string): void {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new RangeError(`${name} must be in [0,1].`);
        }
    }

    public static openProbability(value: number, name: string): void {
        if (!Number.isFinite(value) || value <= 0 || value >= 1) {
            throw new RangeError(`${name} must be in (0,1).`);
        }
    }
}
