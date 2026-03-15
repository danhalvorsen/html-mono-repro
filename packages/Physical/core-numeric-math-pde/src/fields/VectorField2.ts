import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IScalarField2 } from "./IScalarField2.js";
import { IVectorField2 } from "./IVectorField2.js";


export class VectorField2 implements IVectorField2 {
  public constructor(
    public readonly x: IScalarField2,
    public readonly y: IScalarField2
  ) {
    if (x.grid.width !== y.grid.width ||
      x.grid.height !== y.grid.height) {
      throw new Error("VectorField2 component grid mismatch.");
    }
  }

  public get grid(): IUniformGrid2 {
    return this.x.grid;
  }
}
