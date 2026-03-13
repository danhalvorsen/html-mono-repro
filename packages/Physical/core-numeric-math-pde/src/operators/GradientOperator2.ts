import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";
import { IScalarFieldSampler2 } from "../samplers/IScalarFieldSampler2.js";
import { IGradientOperator2 } from "./IGradientOperator2.js";


export class GradientOperator2 implements IGradientOperator2 {
  public constructor(
    private readonly sampler: IScalarFieldSampler2
  ) { }

  public apply(source: IReadOnlyScalarField2, target: IVectorField2): void {
    const twoDx = 2 * source.grid.spacing.x;
    const twoDy = 2 * source.grid.spacing.y;

    for (let j = 0; j < source.grid.height; j++) {
      for (let i = 0; i < source.grid.width; i++) {
        const dDx = (
          this.sampler.sample(source, i + 1, j) -
          this.sampler.sample(source, i - 1, j)
        ) / twoDx;

        const dDy = (
          this.sampler.sample(source, i, j + 1) -
          this.sampler.sample(source, i, j - 1)
        ) / twoDy;

        target.x.write(i, j, dDx);
        target.y.write(i, j, dDy);
      }
    }
  }
}
