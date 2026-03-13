import { IScalarField3 } from "../fields/IScalarField3.js";


export interface IWaveState3 {
  readonly previous: IScalarField3;
  readonly current: IScalarField3;
  readonly next: IScalarField3;
}
