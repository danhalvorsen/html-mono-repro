import { IReadOnlyVectorField2 } from "../fields/IReadOnlyVectorField2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";
import { IVectorFieldFactory2 } from "../factories/IVectorFieldFactory2.js";
import { IVectorFieldBuffer2 } from "./IVectorFieldBuffer2.js";
import { IScalarFieldBuffer2 } from "./IScalarFieldBuffer2.js";

export class VectorFieldBuffer2 implements IVectorFieldBuffer2 {
  public constructor(
    private readonly scalarFieldBuffer: IScalarFieldBuffer2,
    private readonly vectorFieldFactory: IVectorFieldFactory2
  ) { }

  public clone(source: IReadOnlyVectorField2): IVectorField2 {
    const clone = this.vectorFieldFactory.create(source.grid);
    this.copy(source, clone);
    return clone;
  }

  public copy(source: IReadOnlyVectorField2, target: IVectorField2): void {
    this.scalarFieldBuffer.copy(source.x, target.x);
    this.scalarFieldBuffer.copy(source.y, target.y);
  }
}
