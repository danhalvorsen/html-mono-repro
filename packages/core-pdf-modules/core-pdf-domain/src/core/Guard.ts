
export class Guard {
    public static finite(value: number, name: string): void {
        if (!Number.isFinite(value)) {
            throw new Error(`${name} must be finite.`);
        }
    }

    public static nonNegative(value: number, name: string): void {
        this.finite(value, name);

        if (value < 0) {
            throw new Error(`${name} must be non-negative.`);
        }
    }

    public static nonNegativeInteger(value: number, name: string): void {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error(`${name} must be a non-negative integer.`);
        }
    }

    public static positiveInteger(value: number, name: string): void {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(`${name} must be a positive integer.`);
        }
    }

    public static nonEmpty(value: string, name: string): void {
        if (value.trim().length === 0) {
            throw new Error(`${name} is required.`);
        }
    }
}
