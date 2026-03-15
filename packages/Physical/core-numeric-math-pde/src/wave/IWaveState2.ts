import { IScalarField2 } from "../fields/IScalarField2.js";


export interface IWaveState2 {
  readonly previous: IScalarField2;
  readonly current: IScalarField2;
  readonly next: IScalarField2;
}
