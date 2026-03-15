import { IScalarField3 } from "../fields/IScalarField3.js";
import { IDiffusionWorkspace3 } from "./IDiffusionWorkspace3.js";


export class DiffusionWorkspace3 implements IDiffusionWorkspace3 {
  public constructor(
    public readonly laplacian: IScalarField3
  ) { }
}
