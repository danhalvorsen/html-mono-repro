import { IReadOnlyScalarField1 } from "./IReadOnlyScalarField1.js";

export interface IScalarField1 extends IReadOnlyScalarField1 {
  write(i: number, value: number): void;
  fill(value: number): void;
}
