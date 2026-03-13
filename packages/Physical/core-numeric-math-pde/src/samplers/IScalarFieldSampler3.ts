import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";


export interface IScalarFieldSampler3 {
  sample(field: IReadOnlyScalarField3, i: number, j: number, k: number): number;
}
