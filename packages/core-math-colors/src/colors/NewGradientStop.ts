
export class NewGradientStop<TColor> {
    public readonly position: number;
    public readonly color: TColor;

    private constructor(position: number, color: TColor) {
        this.position = NewGradientStop.ensurePosition(position);
        this.color = color;
    }

    public static create<TColor>(position: number, color: TColor): NewGradientStop<TColor> {
        return new NewGradientStop<TColor>(position, color);
    }

    private static ensurePosition(value: number): number {
        if (!Number.isFinite(value)) {
            throw new Error(`Gradient stop position must be finite. Received '${value}'.`);
        }

        if (value < 0 || value > 1) {
            throw new Error(`Gradient stop position must be in range [0..1]. Received '${value}'.`);
        }

        return value;
    }
}
