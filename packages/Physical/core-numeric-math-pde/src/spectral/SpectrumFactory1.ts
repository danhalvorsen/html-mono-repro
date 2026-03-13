import { ISpectrum1 } from "./ISpectrum1.js";
import { ISpectrumFactory1 } from "./ISpectrumFactory1.js";
import { Spectrum1 } from "./Spectrum1.js";

export class SpectrumFactory1 implements ISpectrumFactory1 {
    public create(size: number): ISpectrum1 {
        return new Spectrum1(size);
    }
}
