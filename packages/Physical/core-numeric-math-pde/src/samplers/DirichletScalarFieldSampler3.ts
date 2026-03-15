import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarFieldSampler3 } from "./IScalarFieldSampler3.js";


export class DirichletScalarFieldSampler3 implements IScalarFieldSampler3 {
  public constructor(
    private readonly boundaryValue: number = 0
  ) { }

  public sample(field: IReadOnlyScalarField3, i: number, j: number, k: number): number {
    return field.grid.isInside(i, j, k) ? field.sample(i, j, k) : this.boundaryValue;
  }
}
