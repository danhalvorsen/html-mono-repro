
export class PositiveNumber {
    private constructor(public readonly value: number) { }

    public static create(value: number, name: string): PositiveNumber {
        if (!Number.isFinite(value) || value <= 0) {
            throw new RangeError(`${name} must be > 0.`);
        }

        return new PositiveNumber(value);
    }
}
