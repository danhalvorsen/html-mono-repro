import { IReadOnlyScalarField2 } from "./IReadOnlyScalarField2.js";


export interface IScalarField2 extends IReadOnlyScalarField2 {
  write(i: number, j: number, value: number): void;
  fill(value: number): void;
}
