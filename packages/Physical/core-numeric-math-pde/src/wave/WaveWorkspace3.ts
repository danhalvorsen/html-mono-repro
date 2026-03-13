import { IScalarField3 } from "../fields/IScalarField3.js";
import { IWaveWorkspace3 } from "./IWaveWorkspace3.js";


export class WaveWorkspace3 implements IWaveWorkspace3 {
  public constructor(
    public readonly laplacian: IScalarField3
  ) { }
}
