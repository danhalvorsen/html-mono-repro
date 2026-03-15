import { IScalarField2 } from "./IScalarField2.js";
import { IReadOnlyVectorField2 } from "./IReadOnlyVectorField2.js";

export interface IVectorField2 extends IReadOnlyVectorField2 {
  readonly x: IScalarField2;
  readonly y: IScalarField2;
}
