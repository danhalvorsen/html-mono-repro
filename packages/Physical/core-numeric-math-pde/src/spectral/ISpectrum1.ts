import { IReadOnlySpectrum1 } from "./IReadOnlySpectrum1.js";


export interface ISpectrum1 extends IReadOnlySpectrum1 {
    write(i: number, real: number, imaginary: number): void;
    clear(): void;
}
