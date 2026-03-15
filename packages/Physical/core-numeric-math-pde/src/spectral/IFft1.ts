import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { type IScalarField1 } from "../fields/IScalarField1.js";
import { type IReadOnlySpectrum1 } from "./IReadOnlySpectrum1.js";
import { ISpectrum1 } from "./ISpectrum1.js";
// code.ts
 
export interface IFft1 {
    forward(source: IReadOnlyScalarField1, target: ISpectrum1): void;
    inverse(source: IReadOnlySpectrum1, target: IScalarField1): void;
}
