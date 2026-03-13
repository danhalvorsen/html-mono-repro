import { IScalarField1 } from "../fields/IScalarField1.js";
import { IDiffusionState1 } from "./IDiffusionState1.js";


export class DiffusionState1 implements IDiffusionState1 {
  public constructor(
    public readonly current: IScalarField1,
    public readonly next: IScalarField1
  ) { }
}
