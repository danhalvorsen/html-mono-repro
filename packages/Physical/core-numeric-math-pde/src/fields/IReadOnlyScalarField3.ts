import { IUniformGrid3 } from "../grid/IUniformGrid3.js";


export interface IReadOnlyScalarField3 {
  readonly grid: IUniformGrid3;
  sample(i: number, j: number, k: number): number;
}
