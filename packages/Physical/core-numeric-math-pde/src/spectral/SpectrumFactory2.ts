import { ISpectrum2 } from "./ISpectrum2.js";
import { ISpectrumFactory2 } from "./ISpectrumFactory2.js";
import { Spectrum2 } from "./Spectrum2.js";


export class SpectrumFactory2 implements ISpectrumFactory2 {
    public create(width: number, height: number): ISpectrum2 {
        return new Spectrum2(width, height);
    }
}
