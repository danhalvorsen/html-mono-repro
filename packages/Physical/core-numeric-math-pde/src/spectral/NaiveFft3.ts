import { IReadOnlySpectrum3 } from "./IReadOnlySpectrum3.js";
import { ISpectrum3 } from "./ISpectrum3.js";
import { IFft3 } from "./IFft3.js";
import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
 
export class NaiveFft3 implements IFft3 {
    public forward(source: IReadOnlyScalarField3, target: ISpectrum3): void {
        const width = source.grid.width;
        const height = source.grid.height;
        const depth = source.grid.depth;

        if (target.width !== width ||
            target.height !== height ||
            target.depth !== depth) {
            throw new Error(
                `Spectrum size mismatch. Expected (${width}, ${height}, ${depth}), got (${target.width}, ${target.height}, ${target.depth}).`
            );
        }

        target.clear();

        for (let w = 0; w < depth; w++) {
            for (let v = 0; v < height; v++) {
                for (let u = 0; u < width; u++) {
                    let real = 0;
                    let imaginary = 0;

                    for (let z = 0; z < depth; z++) {
                        for (let y = 0; y < height; y++) {
                            for (let x = 0; x < width; x++) {
                                const angle = (-2 * Math.PI * (
                                    (u * x) / width +
                                    (v * y) / height +
                                    (w * z) / depth
                                ));

                                const value = source.sample(x, y, z);

                                real += value * Math.cos(angle);
                                imaginary += value * Math.sin(angle);
                            }
                        }
                    }

                    target.write(u, v, w, real, imaginary);
                }
            }
        }
    }

    public inverse(source: IReadOnlySpectrum3, target: IScalarField3): void {
        const width = target.grid.width;
        const height = target.grid.height;
        const depth = target.grid.depth;

        if (source.width !== width ||
            source.height !== height ||
            source.depth !== depth) {
            throw new Error(
                `Spectrum size mismatch. Expected (${width}, ${height}, ${depth}), got (${source.width}, ${source.height}, ${source.depth}).`
            );
        }

        const normalizer = width * height * depth;

        for (let z = 0; z < depth; z++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let value = 0;

                    for (let w = 0; w < depth; w++) {
                        for (let v = 0; v < height; v++) {
                            for (let u = 0; u < width; u++) {
                                const angle = (2 * Math.PI * (
                                    (u * x) / width +
                                    (v * y) / height +
                                    (w * z) / depth
                                ));

                                const real = source.sampleReal(u, v, w);
                                const imaginary = source.sampleImaginary(u, v, w);

                                value += (real * Math.cos(angle)) - (imaginary * Math.sin(angle));
                            }
                        }
                    }

                    target.write(x, y, z, value / normalizer);
                }
            }
        }
    }
}
