import { IScalarField2 } from "../fields/IScalarField2.js";
import { IDiffusionWorkspace2 } from "./IDiffusionWorkspace2.js";


export class DiffusionWorkspace2 implements IDiffusionWorkspace2 {
  public constructor(
    public readonly laplacian: IScalarField2
  ) { }
}
