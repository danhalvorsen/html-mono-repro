import { IReadOnlyScalarField3 } from "../fields/IReadOnlyScalarField3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
import { IScalarFieldFactory3 } from "../factories/IScalarFieldFactory3.js";
import { IScalarFieldBuffer3 } from "./IScalarFieldBuffer3.js";
 
export class ScalarFieldBuffer3 implements IScalarFieldBuffer3 {
  public constructor(
    private readonly fieldFactory: IScalarFieldFactory3
  ) { }

  public clone(source: IReadOnlyScalarField3): IScalarField3 {
    const clone = this.fieldFactory.create(source.grid);
    this.copy(source, clone);
    return clone;
  }

  public copy(source: IReadOnlyScalarField3, target: IScalarField3): void {
    for (let k = 0; k < source.grid.depth; k++) {
      for (let j = 0; j < source.grid.height; j++) {
        for (let i = 0; i < source.grid.width; i++) {
          target.write(i, j, k, source.sample(i, j, k));
        }
      }
    }
  }

  public swap(left: IScalarField3, right: IScalarField3): void {
    for (let k = 0; k < left.grid.depth; k++) {
      for (let j = 0; j < left.grid.height; j++) {
        for (let i = 0; i < left.grid.width; i++) {
          const value = left.sample(i, j, k);
          left.write(i, j, k, right.sample(i, j, k));
          right.write(i, j, k, value);
        }
      }
    }
  }
}
