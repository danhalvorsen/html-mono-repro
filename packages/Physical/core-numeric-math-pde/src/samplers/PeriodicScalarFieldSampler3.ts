import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarFieldSampler3 } from "./IScalarFieldSampler3.js";


export class PeriodicScalarFieldSampler3 implements IScalarFieldSampler3 {
  public sample(field: IReadOnlyScalarField3, i: number, j: number, k: number): number {
    const ii = ((i % field.grid.width) + field.grid.width) % field.grid.width;
    const jj = ((j % field.grid.height) + field.grid.height) % field.grid.height;
    const kk = ((k % field.grid.depth) + field.grid.depth) % field.grid.depth;
    return field.sample(ii, jj, kk);
  }
}
