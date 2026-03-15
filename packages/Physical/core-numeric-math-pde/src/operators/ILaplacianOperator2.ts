import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";


export interface ILaplacianOperator2 {
  apply(source: IReadOnlyScalarField2, target: IScalarField2): void;
}
