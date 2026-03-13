import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IReadOnlyScalarField3 } from "./IReadOnlyScalarField3.js";


export interface IReadOnlyVectorField3 {
  readonly grid: IUniformGrid3;
  readonly x: IReadOnlyScalarField3;
  readonly y: IReadOnlyScalarField3;
  readonly z: IReadOnlyScalarField3;
}
