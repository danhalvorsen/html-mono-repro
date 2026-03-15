import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";


export interface IGradientOperator2 {
  apply(source: IReadOnlyScalarField2, target: IVectorField2): void;
}
