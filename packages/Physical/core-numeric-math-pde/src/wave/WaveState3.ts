import { IScalarField3 } from "../fields/IScalarField3.js";
import { IWaveState3 } from "./IWaveState3.js";


export class WaveState3 implements IWaveState3 {
  public constructor(
    public readonly previous: IScalarField3,
    public readonly current: IScalarField3,
    public readonly next: IScalarField3
  ) { }
}
