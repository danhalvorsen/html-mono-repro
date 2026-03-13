import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IReadOnlyScalarField2 } from "./IReadOnlyScalarField2.js";


export interface IReadOnlyVectorField2 {
  readonly grid: IUniformGrid2;
  readonly x: IReadOnlyScalarField2;
  readonly y: IReadOnlyScalarField2;
}
