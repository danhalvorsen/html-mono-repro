import { IReadOnlyScalarField2 } from "../fields/IReadOnlyScalarField2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
import { IScalarFieldFactory2 } from "../factories/IScalarFieldFactory2.js";
import { IScalarFieldBuffer2 } from "./IScalarFieldBuffer2.js";

export class ScalarFieldBuffer2 implements IScalarFieldBuffer2 {
  public constructor(
    private readonly fieldFactory: IScalarFieldFactory2
  ) { }

  public clone(source: IReadOnlyScalarField2): IScalarField2 {
    const clone = this.fieldFactory.create(source.grid);
    this.copy(source, clone);
    return clone;
  }

  public copy(source: IReadOnlyScalarField2, target: IScalarField2): void {
    for (let j = 0; j < source.grid.height; j++) {
      for (let i = 0; i < source.grid.width; i++) {
        target.write(i, j, source.sample(i, j));
      }
    }
  }

  public swap(left: IScalarField2, right: IScalarField2): void {
    for (let j = 0; j < left.grid.height; j++) {
      for (let i = 0; i < left.grid.width; i++) {
        const value = left.sample(i, j);
        left.write(i, j, right.sample(i, j));
        right.write(i, j, value);
      }
    }
  }
}
