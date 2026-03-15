import { IReadOnlySpectrum2 } from "./IReadOnlySpectrum2.js";


export interface ISpectrum2 extends IReadOnlySpectrum2 {
    write(i: number, j: number, real: number, imaginary: number): void;
    clear(): void;
}
