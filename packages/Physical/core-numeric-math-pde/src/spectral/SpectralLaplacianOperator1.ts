import { ISpectrum1 } from "./ISpectrum1.js";
import { IFft1 } from "./IFft1.js";
import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";
import { ILaplacianOperator1 } from "../operators/ILaplacianOperator1.js";
 
// ============================================================
// SPECTRAL OPERATORS
// ============================================================

export class SpectralLaplacianOperator1 implements ILaplacianOperator1 {
    public constructor(
        private readonly fft: IFft1,
        private readonly workingSpectrum: ISpectrum1
    ) { }

    public apply(source: IReadOnlyScalarField1, target: IScalarField1): void {
        const size = source.grid.size;
        const length = source.grid.length;

        this.fft.forward(source, this.workingSpectrum);

        for (let k = 0; k < size; k++) {
            const waveNumber = this.waveNumber(k, size, length);
            const factor = -(waveNumber * waveNumber);

            const real = this.workingSpectrum.sampleReal(k) * factor;
            const imaginary = this.workingSpectrum.sampleImaginary(k) * factor;

            this.workingSpectrum.write(k, real, imaginary);
        }

        this.fft.inverse(this.workingSpectrum, target);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
