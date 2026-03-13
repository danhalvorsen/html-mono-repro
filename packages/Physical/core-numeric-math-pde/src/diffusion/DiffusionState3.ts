import { IScalarField3 } from "../fields/IScalarField3.js";
import { IDiffusionState3 } from "./IDiffusionState3.js";


export class DiffusionState3 implements IDiffusionState3 {
  public constructor(
    public readonly current: IScalarField3,
    public readonly next: IScalarField3
  ) { }
}
