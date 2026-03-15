import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";
import { IFft1 } from "./IFft1.js";
import { IReadOnlySpectrum1 } from "./IReadOnlySpectrum1.js";
import { ISpectrum1 } from "./ISpectrum1.js";
 
// ============================================================
// REFERENCE FFT IMPLEMENTATIONS
// Direct DFT. Correct, deterministic, not optimized.
// ============================================================

export class NaiveFft1 implements IFft1 {
    public forward(source: IReadOnlyScalarField1, target: ISpectrum1): void {
        const size = source.grid.size;

        if (target.size !== size) {
            throw new Error(`Spectrum size mismatch. Expected ${size}, got ${target.size}.`);
        }

        target.clear();

        for (let k = 0; k < size; k++) {
            let real = 0;
            let imaginary = 0;

            for (let n = 0; n < size; n++) {
                const angle = (-2 * Math.PI * k * n) / size;
                const value = source.sample(n);

                real += value * Math.cos(angle);
                imaginary += value * Math.sin(angle);
            }

            target.write(k, real, imaginary);
        }
    }

    public inverse(source: IReadOnlySpectrum1, target: IScalarField1): void {
        const size = target.grid.size;

        if (source.size !== size) {
            throw new Error(`Spectrum size mismatch. Expected ${size}, got ${source.size}.`);
        }

        for (let n = 0; n < size; n++) {
            let value = 0;

            for (let k = 0; k < size; k++) {
                const angle = (2 * Math.PI * k * n) / size;
                const real = source.sampleReal(k);
                const imaginary = source.sampleImaginary(k);

                value += (real * Math.cos(angle)) - (imaginary * Math.sin(angle));
            }

            target.write(n, value / size);
        }
    }
}
