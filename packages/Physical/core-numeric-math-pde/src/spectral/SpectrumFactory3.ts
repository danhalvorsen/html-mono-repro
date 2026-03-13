import { ISpectrum3 } from "./ISpectrum3.js";
import { ISpectrumFactory3 } from "./ISpectrumFactory3.js";
import { Spectrum3 } from "./Spectrum3.js";


export class SpectrumFactory3 implements ISpectrumFactory3 {
    public create(width: number, height: number, depth: number): ISpectrum3 {
        return new Spectrum3(width, height, depth);
    }
}
