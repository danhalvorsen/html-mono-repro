import { IScalarField2 } from "../fields/IScalarField2.js";
import { IWaveState2 } from "./IWaveState2.js";


export class WaveState2 implements IWaveState2 {
  public constructor(
    public readonly previous: IScalarField2,
    public readonly current: IScalarField2,
    public readonly next: IScalarField2
  ) { }
}
