// code.ts
import { NumericGuards } from "@monorepo/core-numeric-math";
import { ISpectrum1 } from "./ISpectrum1.js";

// ============================================================
// SPECTRUM IMPLEMENTATIONS
// ============================================================

export class Spectrum1 implements ISpectrum1 {
    private readonly realValues: Float64Array;
    private readonly imaginaryValues: Float64Array;

    public constructor(
        public readonly size: number
    ) {
        NumericGuards.ensurePositive(size, "size");

        this.realValues = new Float64Array(size);
        this.imaginaryValues = new Float64Array(size);
    }

    public sampleReal(i: number): number {
        return this.realValues[this.indexOf(i)]!;
    }

    public sampleImaginary(i: number): number {
        return this.imaginaryValues[this.indexOf(i)]!;
    }

    public write(i: number, real: number, imaginary: number): void {
        NumericGuards.ensureFinite(real, "real");
        NumericGuards.ensureFinite(imaginary, "imaginary");

        const index = this.indexOf(i);

        this.realValues[index] = real;
        this.imaginaryValues[index] = imaginary;
    }

    public clear(): void {
        this.realValues.fill(0);
        this.imaginaryValues.fill(0);
    }

    private indexOf(i: number): number {
        if (i < 0 || i >= this.size) {
            throw new RangeError(`Index out of range: ${i}.`);
        }

        return i;
    }
}
