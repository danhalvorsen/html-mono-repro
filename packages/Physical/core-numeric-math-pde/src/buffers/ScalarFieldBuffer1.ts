import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";
import { IScalarFieldFactory1 } from "../factories/IScalarFieldFactory1.js";
import { IScalarFieldBuffer1 } from "./IScalarFieldBuffer1.js";
 
export class ScalarFieldBuffer1 implements IScalarFieldBuffer1 {
  public constructor(
    private readonly fieldFactory: IScalarFieldFactory1
  ) { }

  public clone(source: IReadOnlyScalarField1): IScalarField1 {
    const clone = this.fieldFactory.create(source.grid);
    this.copy(source, clone);
    return clone;
  }

  public copy(source: IReadOnlyScalarField1, target: IScalarField1): void {
    for (let i = 0; i < source.grid.size; i++) {
      target.write(i, source.sample(i));
    }
  }

  public swap(left: IScalarField1, right: IScalarField1): void {
    for (let i = 0; i < left.grid.size; i++) {
      const value = left.sample(i);
      left.write(i, right.sample(i));
      right.write(i, value);
    }
  }
}
