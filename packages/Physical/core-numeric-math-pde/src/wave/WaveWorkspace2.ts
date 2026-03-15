import { IScalarField2 } from "../fields/IScalarField2.js";
import { IWaveWorkspace2 } from "./IWaveWorkspace2.js";


export class WaveWorkspace2 implements IWaveWorkspace2 {
  public constructor(
    public readonly laplacian: IScalarField2
  ) { }
}
