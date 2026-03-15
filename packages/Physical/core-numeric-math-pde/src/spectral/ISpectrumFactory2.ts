import { ISpectrum2 } from "./ISpectrum2.js";

export interface ISpectrumFactory2 {
    create(width: number, height: number): ISpectrum2;
}
