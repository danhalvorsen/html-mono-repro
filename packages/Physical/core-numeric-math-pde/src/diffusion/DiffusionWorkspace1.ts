import { IScalarField1 } from "../fields/IScalarField1.js";
import { IDiffusionWorkspace1 } from "./IDiffusionWorkspace1.js";


export class DiffusionWorkspace1 implements IDiffusionWorkspace1 {
  public constructor(
    public readonly laplacian: IScalarField1
  ) { }
}
