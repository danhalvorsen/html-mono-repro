import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarFieldSampler2 } from "./IScalarFieldSampler2.js";


export class NeumannScalarFieldSampler2 implements IScalarFieldSampler2 {
  public sample(field: IReadOnlyScalarField2, i: number, j: number): number {
    const ii = Math.max(0, Math.min(field.grid.width - 1, i));
    const jj = Math.max(0, Math.min(field.grid.height - 1, j));
    return field.sample(ii, jj);
  }
}
