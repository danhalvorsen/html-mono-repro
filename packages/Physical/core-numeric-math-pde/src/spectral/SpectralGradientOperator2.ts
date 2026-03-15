import { ISpectrum2 } from "./ISpectrum2.js";
import { IFft2 } from "./IFft2.js";
import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";
import { IGradientOperator2 } from "../operators/IGradientOperator2.js";
// import type {
//     IReadOnlyScalarField2, IVectorField2, IGradientOperator2
// } from "../common/pde-core.js";

export class SpectralGradientOperator2 implements IGradientOperator2 {
    public constructor(
        private readonly fft: IFft2,
        private readonly sourceSpectrum: ISpectrum2,
        private readonly xSpectrum: ISpectrum2,
        private readonly ySpectrum: ISpectrum2
    ) { }

    public apply(source: IReadOnlyScalarField2, target: IVectorField2): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const lengthX = source.grid.extent.x;
        const lengthY = source.grid.extent.y;

        this.fft.forward(source, this.sourceSpectrum);

        this.xSpectrum.clear();
        this.ySpectrum.clear();

        for (let v = 0; v < height; v++) {
            const ky = this.waveNumber(v, height, lengthY);

            for (let u = 0; u < width; u++) {
                const kx = this.waveNumber(u, width, lengthX);

                const real = this.sourceSpectrum.sampleReal(u, v);
                const imaginary = this.sourceSpectrum.sampleImaginary(u, v);

                this.xSpectrum.write(
                    u,
                    v,
                    -imaginary * kx,
                    real * kx
                );

                this.ySpectrum.write(
                    u,
                    v,
                    -imaginary * ky,
                    real * ky
                );
            }
        }

        this.fft.inverse(this.xSpectrum, target.x);
        this.fft.inverse(this.ySpectrum, target.y);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
