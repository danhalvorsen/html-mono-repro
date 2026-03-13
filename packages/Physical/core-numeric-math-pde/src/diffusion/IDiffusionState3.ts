import { IScalarField3 } from "../fields/IScalarField3.js";


export interface IDiffusionState3 {
  readonly current: IScalarField3;
  readonly next: IScalarField3;
}
