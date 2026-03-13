import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarFieldSampler2 } from "./IScalarFieldSampler2.js";


export class PeriodicScalarFieldSampler2 implements IScalarFieldSampler2 {
  public sample(field: IReadOnlyScalarField2, i: number, j: number): number {
    const ii = ((i % field.grid.width) + field.grid.width) % field.grid.width;
    const jj = ((j % field.grid.height) + field.grid.height) % field.grid.height;
    return field.sample(ii, jj);
  }
}
