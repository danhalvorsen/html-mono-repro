import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";


export interface IGradientOperator3 {
  apply(source: IReadOnlyScalarField3, target: IVectorField3): void;
}
