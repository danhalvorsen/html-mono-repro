import { IScalarField3 } from "../fields/IScalarField3.js";
import { IReadOnlyVectorField3 } from "../fields/IReadOnlyVectorField3.js";
import { IScalarFieldSampler3 } from "../samplers/IScalarFieldSampler3.js";
import { IDivergenceOperator3 } from "./IDivergenceOperator3.js";


export class DivergenceOperator3 implements IDivergenceOperator3 {
  public constructor(
    private readonly sampler: IScalarFieldSampler3
  ) { }

  public apply(source: IReadOnlyVectorField3, target: IScalarField3): void {
    const twoDx = 2 * source.grid.spacing.x;
    const twoDy = 2 * source.grid.spacing.y;
    const twoDz = 2 * source.grid.spacing.z;

    for (let k = 0; k < source.grid.depth; k++) {
      for (let j = 0; j < source.grid.height; j++) {
        for (let i = 0; i < source.grid.width; i++) {
          const duDx = (
            this.sampler.sample(source.x, i + 1, j, k) -
            this.sampler.sample(source.x, i - 1, j, k)
          ) / twoDx;

          const dvDy = (
            this.sampler.sample(source.y, i, j + 1, k) -
            this.sampler.sample(source.y, i, j - 1, k)
          ) / twoDy;

          const dwDz = (
            this.sampler.sample(source.z, i, j, k + 1) -
            this.sampler.sample(source.z, i, j, k - 1)
          ) / twoDz;

          target.write(i, j, k, duDx + dvDy + dwDz);
        }
      }
    }
  }
}
