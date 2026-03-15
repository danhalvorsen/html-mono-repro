import { IScalarField1 } from "../fields/IScalarField1.js";

// ============================================================
// STATE / WORKSPACE CONTRACTS
// ============================================================

export interface IWaveState1 {
  readonly previous: IScalarField1;
  readonly current: IScalarField1;
  readonly next: IScalarField1;
}
