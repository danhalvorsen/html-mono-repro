// code.ts
import { NumericGuards } from "@monorepo/core-numeric-math";
import { ISpectrum2 } from "./ISpectrum2.js";


export class Spectrum2 implements ISpectrum2 {
    private readonly realValues: Float64Array;
    private readonly imaginaryValues: Float64Array;

    public constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        NumericGuards.ensurePositive(width, "width");
        NumericGuards.ensurePositive(height, "height");

        this.realValues = new Float64Array(width * height);
        this.imaginaryValues = new Float64Array(width * height);
    }

    public sampleReal(i: number, j: number): number {
        return this.realValues[this.indexOf(i, j)]!;
    }

    public sampleImaginary(i: number, j: number): number {
        return this.imaginaryValues[this.indexOf(i, j)]!;
    }

    public write(i: number, j: number, real: number, imaginary: number): void {
        NumericGuards.ensureFinite(real, "real");
        NumericGuards.ensureFinite(imaginary, "imaginary");

        const index = this.indexOf(i, j);

        this.realValues[index] = real;
        this.imaginaryValues[index] = imaginary;
    }

    public clear(): void {
        this.realValues.fill(0);
        this.imaginaryValues.fill(0);
    }

    private indexOf(i: number, j: number): number {
        if (i < 0 || i >= this.width || j < 0 || j >= this.height) {
            throw new RangeError(`Index out of range: (${i}, ${j}).`);
        }

        return i + (j * this.width);
    }
}
