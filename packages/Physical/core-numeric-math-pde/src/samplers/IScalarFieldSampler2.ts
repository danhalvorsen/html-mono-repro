import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";


export interface IScalarFieldSampler2 {
  sample(field: IReadOnlyScalarField2, i: number, j: number): number;
}
