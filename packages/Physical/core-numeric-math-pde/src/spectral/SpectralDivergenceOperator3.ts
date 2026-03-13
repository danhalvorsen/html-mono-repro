import { ISpectrum3 } from "./ISpectrum3.js";
import { IFft3 } from "./IFft3.js";
import { IReadOnlyVectorField3 } from "../fields/IReadOnlyVectorField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
import { IDivergenceOperator3 } from "../operators/IDivergenceOperator3.js";
 
export class SpectralDivergenceOperator3 implements IDivergenceOperator3 {
    public constructor(
        private readonly fft: IFft3,
        private readonly xSpectrum: ISpectrum3,
        private readonly ySpectrum: ISpectrum3,
        private readonly zSpectrum: ISpectrum3,
        private readonly resultSpectrum: ISpectrum3
    ) { }

    public apply(source: IReadOnlyVectorField3, target: IScalarField3): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const depth = source.grid.depth;
        const lengthX = source.grid.extent.x;
        const lengthY = source.grid.extent.y;
        const lengthZ = source.grid.extent.z;

        this.fft.forward(source.x, this.xSpectrum);
        this.fft.forward(source.y, this.ySpectrum);
        this.fft.forward(source.z, this.zSpectrum);

        this.resultSpectrum.clear();

        for (let w = 0; w < depth; w++) {
            const kz = this.waveNumber(w, depth, lengthZ);

            for (let v = 0; v < height; v++) {
                const ky = this.waveNumber(v, height, lengthY);

                for (let u = 0; u < width; u++) {
                    const kx = this.waveNumber(u, width, lengthX);

                    const uxReal = this.xSpectrum.sampleReal(u, v, w);
                    const uxImaginary = this.xSpectrum.sampleImaginary(u, v, w);

                    const uyReal = this.ySpectrum.sampleReal(u, v, w);
                    const uyImaginary = this.ySpectrum.sampleImaginary(u, v, w);

                    const uzReal = this.zSpectrum.sampleReal(u, v, w);
                    const uzImaginary = this.zSpectrum.sampleImaginary(u, v, w);

                    const real = (-uxImaginary * kx) +
                        (-uyImaginary * ky) +
                        (-uzImaginary * kz);

                    const imaginary = (uxReal * kx) +
                        (uyReal * ky) +
                        (uzReal * kz);

                    this.resultSpectrum.write(u, v, w, real, imaginary);
                }
            }
        }

        this.fft.inverse(this.resultSpectrum, target);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
