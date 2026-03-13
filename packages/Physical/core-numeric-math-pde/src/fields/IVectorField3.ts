import { IScalarField3 } from "./IScalarField3.js";
import { IReadOnlyVectorField3 } from "./IReadOnlyVectorField3.js";


export interface IVectorField3 extends IReadOnlyVectorField3 {
  readonly x: IScalarField3;
  readonly y: IScalarField3;
  readonly z: IScalarField3;
}
