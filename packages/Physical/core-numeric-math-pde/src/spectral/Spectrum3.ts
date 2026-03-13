// code.ts
import { NumericGuards } from "@monorepo/core-numeric-math";
import { ISpectrum3 } from "./ISpectrum3.js";


export class Spectrum3 implements ISpectrum3 {
    private readonly realValues: Float64Array;
    private readonly imaginaryValues: Float64Array;

    public constructor(
        public readonly width: number,
        public readonly height: number,
        public readonly depth: number
    ) {
        NumericGuards.ensurePositive(width, "width");
        NumericGuards.ensurePositive(height, "height");
        NumericGuards.ensurePositive(depth, "depth");

        this.realValues = new Float64Array(width * height * depth);
        this.imaginaryValues = new Float64Array(width * height * depth);
    }

    public sampleReal(i: number, j: number, k: number): number {
        return this.realValues[this.indexOf(i, j, k)]!;
    }

    public sampleImaginary(i: number, j: number, k: number): number {
        return this.imaginaryValues[this.indexOf(i, j, k)]!;
    }

    public write(i: number, j: number, k: number, real: number, imaginary: number): void {
        NumericGuards.ensureFinite(real, "real");
        NumericGuards.ensureFinite(imaginary, "imaginary");

        const index = this.indexOf(i, j, k);

        this.realValues[index] = real;
        this.imaginaryValues[index] = imaginary;
    }

    public clear(): void {
        this.realValues.fill(0);
        this.imaginaryValues.fill(0);
    }

    private indexOf(i: number, j: number, k: number): number {
        if (i < 0 || i >= this.width ||
            j < 0 || j >= this.height ||
            k < 0 || k >= this.depth) {
            throw new RangeError(`Index out of range: (${i}, ${j}, ${k}).`);
        }

        return i + (j * this.width) + (k * this.width * this.height);
    }
}
