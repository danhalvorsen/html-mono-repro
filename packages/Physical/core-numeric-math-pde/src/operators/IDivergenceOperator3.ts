import { IScalarField3 } from "../fields/IScalarField3.js";
import { IReadOnlyVectorField3 } from "../fields/IReadOnlyVectorField3.js";


export interface IDivergenceOperator3 {
  apply(source: IReadOnlyVectorField3, target: IScalarField3): void;
}
