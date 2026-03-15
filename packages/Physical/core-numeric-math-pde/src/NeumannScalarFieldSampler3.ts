import { IReadOnlyScalarField3 } from "./fields/IReadOnlyScalarField3.js";
import { IScalarFieldSampler3 } from "./samplers/IScalarFieldSampler3.js";


export class NeumannScalarFieldSampler3 implements IScalarFieldSampler3 {
  public sample(field: IReadOnlyScalarField3, i: number, j: number, k: number): number {
    const ii = Math.max(0, Math.min(field.grid.width - 1, i));
    const jj = Math.max(0, Math.min(field.grid.height - 1, j));
    const kk = Math.max(0, Math.min(field.grid.depth - 1, k));
    return field.sample(ii, jj, kk);
  }
}
