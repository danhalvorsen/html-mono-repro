import { IScalarField1 } from "../fields/IScalarField1.js";
import { IWaveState1 } from "./IWaveState1.js";

// ============================================================
// STATE / WORKSPACE IMPLEMENTATIONS
// ============================================================

export class WaveState1 implements IWaveState1 {
  public constructor(
    public readonly previous: IScalarField1,
    public readonly current: IScalarField1,
    public readonly next: IScalarField1
  ) { }
}
