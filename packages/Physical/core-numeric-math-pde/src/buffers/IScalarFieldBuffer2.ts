import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";


export interface IScalarFieldBuffer2 {
  clone(source: IReadOnlyScalarField2): IScalarField2;
  copy(source: IReadOnlyScalarField2, target: IScalarField2): void;
  swap(left: IScalarField2, right: IScalarField2): void;
}
