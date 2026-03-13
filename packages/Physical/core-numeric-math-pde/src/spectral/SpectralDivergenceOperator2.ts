import { ISpectrum2 } from "./ISpectrum2.js";
import { IFft2 } from "./IFft2.js";
import { IReadOnlyVectorField2 } from "../fields/IReadOnlyVectorField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
import { IDivergenceOperator2 } from "../operators/IDivergenceOperator2.js";
 
export class SpectralDivergenceOperator2 implements IDivergenceOperator2 {
    public constructor(
        private readonly fft: IFft2,
        private readonly xSpectrum: ISpectrum2,
        private readonly ySpectrum: ISpectrum2,
        private readonly resultSpectrum: ISpectrum2
    ) { }

    public apply(source: IReadOnlyVectorField2, target: IScalarField2): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const lengthX = source.grid.extent.x;
        const lengthY = source.grid.extent.y;

        this.fft.forward(source.x, this.xSpectrum);
        this.fft.forward(source.y, this.ySpectrum);

        this.resultSpectrum.clear();

        for (let v = 0; v < height; v++) {
            const ky = this.waveNumber(v, height, lengthY);

            for (let u = 0; u < width; u++) {
                const kx = this.waveNumber(u, width, lengthX);

                const uxReal = this.xSpectrum.sampleReal(u, v);
                const uxImaginary = this.xSpectrum.sampleImaginary(u, v);

                const uyReal = this.ySpectrum.sampleReal(u, v);
                const uyImaginary = this.ySpectrum.sampleImaginary(u, v);

                const real = (-uxImaginary * kx) + (-uyImaginary * ky);
                const imaginary = (uxReal * kx) + (uyReal * ky);

                this.resultSpectrum.write(u, v, real, imaginary);
            }
        }

        this.fft.inverse(this.resultSpectrum, target);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
