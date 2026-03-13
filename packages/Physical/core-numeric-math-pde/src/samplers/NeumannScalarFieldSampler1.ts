import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarFieldSampler1 } from "./IScalarFieldSampler1.js";


export class NeumannScalarFieldSampler1 implements IScalarFieldSampler1 {
  public sample(field: IReadOnlyScalarField1, i: number): number {
    const clamped = Math.max(0, Math.min(field.grid.size - 1, i));
    return field.sample(clamped);
  }
}
