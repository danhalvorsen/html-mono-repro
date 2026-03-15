import { IReadOnlyScalarField3 } from "./IReadOnlyScalarField3.js";


export interface IScalarField3 extends IReadOnlyScalarField3 {
  write(i: number, j: number, k: number, value: number): void;
  fill(value: number): void;
}
