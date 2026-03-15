import { IReadOnlySpectrum2 } from "./IReadOnlySpectrum2.js";
import { ISpectrum2 } from "./ISpectrum2.js";
import { IFft2 } from "./IFft2.js";
import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
 
export class NaiveFft2 implements IFft2 {
    public forward(source: IReadOnlyScalarField2, target: ISpectrum2): void {
        const width = source.grid.width;
        const height = source.grid.height;

        if (target.width !== width || target.height !== height) {
            throw new Error(
                `Spectrum size mismatch. Expected (${width}, ${height}), got (${target.width}, ${target.height}).`
            );
        }

        target.clear();

        for (let v = 0; v < height; v++) {
            for (let u = 0; u < width; u++) {
                let real = 0;
                let imaginary = 0;

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const angle = (-2 * Math.PI * ((u * x) / width + (v * y) / height));

                        const value = source.sample(x, y);

                        real += value * Math.cos(angle);
                        imaginary += value * Math.sin(angle);
                    }
                }

                target.write(u, v, real, imaginary);
            }
        }
    }

    public inverse(source: IReadOnlySpectrum2, target: IScalarField2): void {
        const width = target.grid.width;
        const height = target.grid.height;

        if (source.width !== width || source.height !== height) {
            throw new Error(
                `Spectrum size mismatch. Expected (${width}, ${height}), got (${source.width}, ${source.height}).`
            );
        }

        const normalizer = width * height;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let value = 0;

                for (let v = 0; v < height; v++) {
                    for (let u = 0; u < width; u++) {
                        const angle = (2 * Math.PI * ((u * x) / width + (v * y) / height));

                        const real = source.sampleReal(u, v);
                        const imaginary = source.sampleImaginary(u, v);

                        value += (real * Math.cos(angle)) - (imaginary * Math.sin(angle));
                    }
                }

                target.write(x, y, value / normalizer);
            }
        }
    }
}
