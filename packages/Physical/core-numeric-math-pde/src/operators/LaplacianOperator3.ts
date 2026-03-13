import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
import { IScalarFieldSampler3 } from "../samplers/IScalarFieldSampler3.js";
import { ILaplacianOperator3 } from "./ILaplacianOperator3.js";


export class LaplacianOperator3 implements ILaplacianOperator3 {
  public constructor(
    private readonly sampler: IScalarFieldSampler3
  ) { }

  public apply(source: IReadOnlyScalarField3, target: IScalarField3): void {
    const dx2 = source.grid.spacing.x * source.grid.spacing.x;
    const dy2 = source.grid.spacing.y * source.grid.spacing.y;
    const dz2 = source.grid.spacing.z * source.grid.spacing.z;

    for (let k = 0; k < source.grid.depth; k++) {
      for (let j = 0; j < source.grid.height; j++) {
        for (let i = 0; i < source.grid.width; i++) {
          const center = source.sample(i, j, k);
          const left = this.sampler.sample(source, i - 1, j, k);
          const right = this.sampler.sample(source, i + 1, j, k);
          const top = this.sampler.sample(source, i, j - 1, k);
          const bottom = this.sampler.sample(source, i, j + 1, k);
          const front = this.sampler.sample(source, i, j, k - 1);
          const back = this.sampler.sample(source, i, j, k + 1);

          const dxx = (left - (2 * center) + right) / dx2;
          const dyy = (top - (2 * center) + bottom) / dy2;
          const dzz = (front - (2 * center) + back) / dz2;

          target.write(i, j, k, dxx + dyy + dzz);
        }
      }
    }
  }
}
