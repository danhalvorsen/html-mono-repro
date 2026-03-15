import { IScalarField2 } from "../fields/IScalarField2.js";
import { IReadOnlyVectorField2 } from "../fields/IReadOnlyVectorField2.js";
import { IScalarFieldSampler2 } from "../samplers/IScalarFieldSampler2.js";
import { IDivergenceOperator2 } from "./IDivergenceOperator2.js";

export class DivergenceOperator2 implements IDivergenceOperator2 {
  public constructor(
    private readonly sampler: IScalarFieldSampler2
  ) { }

  public apply(source: IReadOnlyVectorField2, target: IScalarField2): void {
    const twoDx = 2 * source.grid.spacing.x;
    const twoDy = 2 * source.grid.spacing.y;

    for (let j = 0; j < source.grid.height; j++) {
      for (let i = 0; i < source.grid.width; i++) {
        const duDx = (
          this.sampler.sample(source.x, i + 1, j) -
          this.sampler.sample(source.x, i - 1, j)
        ) / twoDx;

        const dvDy = (
          this.sampler.sample(source.y, i, j + 1) -
          this.sampler.sample(source.y, i, j - 1)
        ) / twoDy;

        target.write(i, j, duDx + dvDy);
      }
    }
  }
}
