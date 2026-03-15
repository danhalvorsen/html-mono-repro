import { ISpectrum3 } from "./ISpectrum3.js";
import { IFft3 } from "./IFft3.js";
import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
import { ILaplacianOperator3 } from "../operators/ILaplacianOperator3.js";
 ;

export class SpectralLaplacianOperator3 implements ILaplacianOperator3 {
    public constructor(
        private readonly fft: IFft3,
        private readonly workingSpectrum: ISpectrum3
    ) { }

    public apply(source: IReadOnlyScalarField3, target: IScalarField3): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const depth = source.grid.depth;
        const lengthX = source.grid.extent.x;
        const lengthY = source.grid.extent.y;
        const lengthZ = source.grid.extent.z;

        this.fft.forward(source, this.workingSpectrum);

        for (let w = 0; w < depth; w++) {
            const kz = this.waveNumber(w, depth, lengthZ);

            for (let v = 0; v < height; v++) {
                const ky = this.waveNumber(v, height, lengthY);

                for (let u = 0; u < width; u++) {
                    const kx = this.waveNumber(u, width, lengthX);
                    const factor = -((kx * kx) + (ky * ky) + (kz * kz));

                    const real = this.workingSpectrum.sampleReal(u, v, w) * factor;
                    const imaginary = this.workingSpectrum.sampleImaginary(u, v, w) * factor;

                    this.workingSpectrum.write(u, v, w, real, imaginary);
                }
            }
        }

        this.fft.inverse(this.workingSpectrum, target);
    }

    private waveNumber(index: number, size: number, length: number): number {
        const shifted = index <= (size / 2) ? index : index - size;
        return (2 * Math.PI * shifted) / length;
    }
}
