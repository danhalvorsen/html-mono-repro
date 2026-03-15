import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";


export interface IScalarFieldBuffer3 {
  clone(source: IReadOnlyScalarField3): IScalarField3;
  copy(source: IReadOnlyScalarField3, target: IScalarField3): void;
  swap(left: IScalarField3, right: IScalarField3): void;
}
