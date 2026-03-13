import { IScalarField2 } from "../fields/IScalarField2.js";
import { IReadOnlyVectorField2 } from "../fields/IReadOnlyVectorField2.js";

export interface IDivergenceOperator2 {
  apply(source: IReadOnlyVectorField2, target: IScalarField2): void;
}
