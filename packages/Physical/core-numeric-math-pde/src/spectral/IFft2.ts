import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
import { IReadOnlySpectrum2 } from "./IReadOnlySpectrum2.js";
import { ISpectrum2 } from "./ISpectrum2.js";
// code.ts
 
export interface IFft2 {
    forward(source: IReadOnlyScalarField2, target: ISpectrum2): void;
    inverse(source: IReadOnlySpectrum2, target: IScalarField2): void;
}
