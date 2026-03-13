import { IUniformGrid2 } from "../grid/IUniformGrid2.js";


export interface IReadOnlyScalarField2 {
  readonly grid: IUniformGrid2;
  sample(i: number, j: number): number;
}
