import { ISpectrum3 } from "./ISpectrum3.js";
import { IFft3 } from "./IFft3.js";
import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";
import { IGradientOperator3 } from "../operators/IGradientOperator3.js";
 
export class SpectralGradientOperator3 implements IGradientOperator3 {
    public constructor(
        private readonly fft: IFft3,
        private readonly sourceSpectrum: ISpectrum3,
        private readonly xSpectrum: ISpectrum3,
        private readonly ySpectrum: ISpectrum3,
        private readonly zSpectrum: ISpectrum3
    ) { }

    public apply(source: IReadOnlyScalarField3, target: IVectorField3): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const depth = source.grid.depth;
        const lengthX = source.grid.extent.x;
        const lengthY = source.grid.extent.y;
        const lengthZ = source.grid.extent.z;

        this.fft.forward(source, this.sourceSpectrum);

        this.xSpectrum.clear();
        this.ySpectrum.clear();
        this.zSpectrum.clear();

        for (let w = 0; w < depth; w++) {
            const kz = this.waveNumber(w, depth, lengthZ);

            for (let v = 0; v < height; v++) {
                const ky = this.waveNumber(v, height, lengthY);

                for (let u = 0; u < width; u++) {
                    const kx = this.waveNumber(u, width, lengthX);

                    const real = this.sourceSpectrum.sampleReal(u, v, w);
                    const imaginary = this.sourceSpectrum.sampleImaginary(u, v, w);

                    this.xSpectrum.write(u, v, w, -imaginary * kx, real * kx);
                    this.ySpectrum.write(u, v, w, -imaginary * ky, real * ky);
                    this.zSpectrum.write(u, v, w, -imaginary * kz, real * kz);
                }
            }
        }

        this.fft.inverse(this.xSpectrum, target.x);
        this.fft.inverse(this.ySpectrum, target.y);
        this.fft.inverse(this.zSpectrum, target.z);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
