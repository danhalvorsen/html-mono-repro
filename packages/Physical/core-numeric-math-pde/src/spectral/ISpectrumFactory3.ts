import { ISpectrum3 } from "./ISpectrum3.js";


export interface ISpectrumFactory3 {
    create(width: number, height: number, depth: number): ISpectrum3;
}
