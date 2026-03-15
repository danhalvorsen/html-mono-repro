import { IReadOnlySpectrum3 } from "./IReadOnlySpectrum3.js";
import { ISpectrum3 } from "./ISpectrum3.js";
import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
 
export interface IFft3 {
    forward(source: IReadOnlyScalarField3, target: ISpectrum3): void;
    inverse(source: IReadOnlySpectrum3, target: IScalarField3): void;
}
