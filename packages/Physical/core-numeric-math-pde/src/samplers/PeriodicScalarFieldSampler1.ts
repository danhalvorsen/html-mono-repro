import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarFieldSampler1 } from "./IScalarFieldSampler1.js";


export class PeriodicScalarFieldSampler1 implements IScalarFieldSampler1 {
  public sample(field: IReadOnlyScalarField1, i: number): number {
    const ii = ((i % field.grid.size) + field.grid.size) % field.grid.size;
    return field.sample(ii);
  }
}
