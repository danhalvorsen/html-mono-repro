import { IReadOnlyVectorField3 } from "../fields/IReadOnlyVectorField3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";
import { IVectorFieldFactory3 } from "../factories/IVectorFieldFactory3.js";
import { IVectorFieldBuffer3 } from "./IVectorFieldBuffer3.js";
import { IScalarFieldBuffer3 } from "./IScalarFieldBuffer3.js";
export class VectorFieldBuffer3 implements IVectorFieldBuffer3 {
  public constructor(
    private readonly scalarFieldBuffer: IScalarFieldBuffer3,
    private readonly vectorFieldFactory: IVectorFieldFactory3
  ) { }

  public clone(source: IReadOnlyVectorField3): IVectorField3 {
    const clone = this.vectorFieldFactory.create(source.grid);
    this.copy(source, clone);
    return clone;
  }

  public copy(source: IReadOnlyVectorField3, target: IVectorField3): void {
    this.scalarFieldBuffer.copy(source.x, target.x);
    this.scalarFieldBuffer.copy(source.y, target.y);
    this.scalarFieldBuffer.copy(source.z, target.z);
  }
}
