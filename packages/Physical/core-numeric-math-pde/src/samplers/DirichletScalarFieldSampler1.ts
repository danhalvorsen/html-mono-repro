import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarFieldSampler1 } from "./IScalarFieldSampler1.js";

// ============================================================
// SAMPLER IMPLEMENTATIONS
// ============================================================

export class DirichletScalarFieldSampler1 implements IScalarFieldSampler1 {
  public constructor(
    private readonly boundaryValue: number = 0
  ) { }

  public sample(field: IReadOnlyScalarField1, i: number): number {
    return field.grid.isInside(i) ? field.sample(i) : this.boundaryValue;
  }
}
