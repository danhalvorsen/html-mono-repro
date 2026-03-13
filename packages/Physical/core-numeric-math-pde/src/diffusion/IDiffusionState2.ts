import { IScalarField2 } from "../fields/IScalarField2.js";


export interface IDiffusionState2 {
  readonly current: IScalarField2;
  readonly next: IScalarField2;
}
