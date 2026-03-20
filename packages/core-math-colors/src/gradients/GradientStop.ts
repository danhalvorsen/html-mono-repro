// ====================================================================================
// FILE: src/gradients/GradientStop.ts
// ====================================================================================
import { Color } from "../colors/Color.js";


export class GradientStop {
    public readonly position: number;
    public readonly color: Color;

    private constructor(position: number, color: Color) {
        this.position = GradientStop.ensurePosition(position);
        this.color = color;
    }

    public static create(position: number, color: Color): GradientStop {
        return new GradientStop(position, color);
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
