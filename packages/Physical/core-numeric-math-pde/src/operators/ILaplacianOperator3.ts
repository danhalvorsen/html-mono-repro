import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";


export interface ILaplacianOperator3 {
  apply(source: IReadOnlyScalarField3, target: IScalarField3): void;
}
