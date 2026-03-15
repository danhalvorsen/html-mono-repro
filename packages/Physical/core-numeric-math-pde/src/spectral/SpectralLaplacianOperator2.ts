import { ISpectrum2 } from "./ISpectrum2.js";
import { IFft2 } from "./IFft2.js";
import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
import { ILaplacianOperator2 } from "../operators/ILaplacianOperator2.js";
    
export class SpectralLaplacianOperator2 implements ILaplacianOperator2 {
    public constructor(
        private readonly fft: IFft2,
        private readonly workingSpectrum: ISpectrum2
    ) { }

    public apply(source: IReadOnlyScalarField2, target: IScalarField2): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const lengthX = source.grid.extent.x;
        const lengthY = source.grid.extent.y;

        this.fft.forward(source, this.workingSpectrum);

        for (let v = 0; v < height; v++) {
            const ky = this.waveNumber(v, height, lengthY);

            for (let u = 0; u < width; u++) {
                const kx = this.waveNumber(u, width, lengthX);
                const factor = -((kx * kx) + (ky * ky));

                const real = this.workingSpectrum.sampleReal(u, v) * factor;
                const imaginary = this.workingSpectrum.sampleImaginary(u, v) * factor;

                this.workingSpectrum.write(u, v, real, imaginary);
            }
        }

        this.fft.inverse(this.workingSpectrum, target);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
