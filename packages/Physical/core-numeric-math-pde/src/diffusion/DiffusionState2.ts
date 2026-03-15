import { IScalarField2 } from "../fields/IScalarField2.js";
import { IDiffusionState2 } from "./IDiffusionState2.js";


export class DiffusionState2 implements IDiffusionState2 {
  public constructor(
    public readonly current: IScalarField2,
    public readonly next: IScalarField2
  ) { }
}
