 
// ====================================================================================
import { INewGradient } from "./INewGradient.js";
import type { NewGradientStop } from "./NewGradientStop.js";

export class NewGradient<TColor> implements INewGradient<TColor> {
    private readonly gradientName: string;
    private readonly stops: readonly NewGradientStop<TColor>[];

    private constructor(name: string, stops: readonly NewGradientStop<TColor>[]) {
        this.gradientName = name;
        this.stops = stops;
    }

    public static create<TColor>(
        stops: readonly NewGradientStop<TColor>[],
        name: string = "gradient"
    ): NewGradient<TColor> {
        NewGradient.ensureNotEmpty(stops);

        const orderedStops = [...stops].sort((left, right) => left.position - right.position);

        NewGradient.ensureUniquePositions(orderedStops);

        return new NewGradient<TColor>(NewGradient.normalizeName(name), orderedStops);
    }

    public get name(): string {
        return this.gradientName;
    }

    public get count(): number {
        return this.stops.length;
    }

    public getAt(index: number): NewGradientStop<TColor> {
        NewGradient.ensureValidIndex(index, this.stops.length);

        const stop = this.stops[index];

        if (stop === undefined) {
            throw new Error(`Gradient stop at index '${index}' was undefined.`);
        }

        return stop;
    }

    public getAll(): readonly NewGradientStop<TColor>[] {
        return [...this.stops];
    }

    private static ensureNotEmpty<TColor>(stops: readonly NewGradientStop<TColor>[]): void {
        if (stops.length === 0) {
            throw new Error("Gradient must contain at least one stop.");
        }
    }

    private static normalizeName(name: string): string {
        const normalized = name.trim();
        return normalized.length > 0 ? normalized : "gradient";
    }

    private static ensureUniquePositions<TColor>(stops: readonly NewGradientStop<TColor>[]): void {
        for (let index = 1; index < stops.length; index += 1) {
            const previous = stops[index - 1];
            const current = stops[index];

            if (previous === undefined || current === undefined) {
                throw new Error("Gradient contains an invalid stop sequence.");
            }

            if (previous.position === current.position) {
                throw new Error(
                    `Gradient stop positions must be unique. Duplicate position '${current.position}'.`
                );
            }
        }
    }

    private static ensureValidIndex(index: number, length: number): void {
        if (!Number.isInteger(index)) {
            throw new Error(`Gradient stop index must be an integer. Received '${index}'.`);
        }

        if (index < 0 || index >= length) {
            throw new Error(`Gradient stop index '${index}' is out of range.`);
        }
    }
}
