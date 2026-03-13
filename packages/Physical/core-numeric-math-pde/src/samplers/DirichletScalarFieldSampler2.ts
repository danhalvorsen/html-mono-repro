import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarFieldSampler2 } from "./IScalarFieldSampler2.js";


export class DirichletScalarFieldSampler2 implements IScalarFieldSampler2 {
  public constructor(
    private readonly boundaryValue: number = 0
  ) { }

  public sample(field: IReadOnlyScalarField2, i: number, j: number): number {
    return field.grid.isInside(i, j) ? field.sample(i, j) : this.boundaryValue;
  }
}
