import { IScalarField1 } from "../fields/IScalarField1.js";

export interface IDiffusionState1 {
  readonly current: IScalarField1;
  readonly next: IScalarField1;
}
