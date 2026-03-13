import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
import { IScalarFieldSampler2 } from "../samplers/IScalarFieldSampler2.js";
import { ILaplacianOperator2 } from "./ILaplacianOperator2.js";


export class LaplacianOperator2 implements ILaplacianOperator2 {
  public constructor(
    private readonly sampler: IScalarFieldSampler2
  ) { }

  public apply(source: IReadOnlyScalarField2, target: IScalarField2): void {
    const dx2 = source.grid.spacing.x * source.grid.spacing.x;
    const dy2 = source.grid.spacing.y * source.grid.spacing.y;

    for (let j = 0; j < source.grid.height; j++) {
      for (let i = 0; i < source.grid.width; i++) {
        const center = source.sample(i, j);
        const left = this.sampler.sample(source, i - 1, j);
        const right = this.sampler.sample(source, i + 1, j);
        const top = this.sampler.sample(source, i, j - 1);
        const bottom = this.sampler.sample(source, i, j + 1);

        const dxx = (left - (2 * center) + right) / dx2;
        const dyy = (top - (2 * center) + bottom) / dy2;

        target.write(i, j, dxx + dyy);
      }
    }
  }
}
