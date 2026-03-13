import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";
import { IScalarFieldSampler1 } from "../samplers/IScalarFieldSampler1.js";
import { ILaplacianOperator1 } from "./ILaplacianOperator1.js";

// ============================================================
// OPERATOR IMPLEMENTATIONS
// ============================================================

export class LaplacianOperator1 implements ILaplacianOperator1 {
  public constructor(
    private readonly sampler: IScalarFieldSampler1
  ) { }

  public apply(source: IReadOnlyScalarField1, target: IScalarField1): void {
    const dx2 = source.grid.spacing * source.grid.spacing;

    for (let i = 0; i < source.grid.size; i++) {
      const left = this.sampler.sample(source, i - 1);
      const center = source.sample(i);
      const right = this.sampler.sample(source, i + 1);

      const value = (left - (2 * center) + right) / dx2;
      target.write(i, value);
    }
  }
}
