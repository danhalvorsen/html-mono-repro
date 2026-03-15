import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";


export interface IScalarFieldBuffer1 {
  clone(source: IReadOnlyScalarField1): IScalarField1;
  copy(source: IReadOnlyScalarField1, target: IScalarField1): void;
  swap(left: IScalarField1, right: IScalarField1): void;
}
