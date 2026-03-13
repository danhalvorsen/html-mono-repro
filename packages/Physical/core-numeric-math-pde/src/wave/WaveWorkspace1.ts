import { IScalarField1 } from "../fields/IScalarField1.js";
import { IWaveWorkspace1 } from "./IWaveWorkspace1.js";


export class WaveWorkspace1 implements IWaveWorkspace1 {
  public constructor(
    public readonly laplacian: IScalarField1
  ) { }
}
