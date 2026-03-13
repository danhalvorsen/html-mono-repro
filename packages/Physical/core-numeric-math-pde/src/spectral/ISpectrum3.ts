import { IReadOnlySpectrum3 } from "./IReadOnlySpectrum3.js";


export interface ISpectrum3 extends IReadOnlySpectrum3 {
    write(i: number, j: number, k: number, real: number, imaginary: number): void;
    clear(): void;
}
