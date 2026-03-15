import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";
import { IGradientOperator3 } from "./IGradientOperator3.js";
import { IScalarFieldSampler3 } from "../samplers/IScalarFieldSampler3.js";


export class GradientOperator3 implements IGradientOperator3 {
  public constructor(
    private readonly sampler: IScalarFieldSampler3
  ) { }

  public apply(source: IReadOnlyScalarField3, target: IVectorField3): void {
    const twoDx = 2 * source.grid.spacing.x;
    const twoDy = 2 * source.grid.spacing.y;
    const twoDz = 2 * source.grid.spacing.z;

    for (let k = 0; k < source.grid.depth; k++) {
      for (let j = 0; j < source.grid.height; j++) {
        for (let i = 0; i < source.grid.width; i++) {
          const dDx = (
            this.sampler.sample(source, i + 1, j, k) -
            this.sampler.sample(source, i - 1, j, k)
          ) / twoDx;

          const dDy = (
            this.sampler.sample(source, i, j + 1, k) -
            this.sampler.sample(source, i, j - 1, k)
          ) / twoDy;

          const dDz = (
            this.sampler.sample(source, i, j, k + 1) -
            this.sampler.sample(source, i, j, k - 1)
          ) / twoDz;

          target.x.write(i, j, k, dDx);
          target.y.write(i, j, k, dDy);
          target.z.write(i, j, k, dDz);
        }
      }
    }
  }
}
