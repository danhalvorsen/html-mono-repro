import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IScalarField3 } from "./IScalarField3.js";
import { IVectorField3 } from "./IVectorField3.js";

export class VectorField3 implements IVectorField3 {
  public constructor(
    public readonly x: IScalarField3,
    public readonly y: IScalarField3,
    public readonly z: IScalarField3
  ) {
    if (x.grid.width !== y.grid.width || x.grid.width !== z.grid.width ||
      x.grid.height !== y.grid.height || x.grid.height !== z.grid.height ||
      x.grid.depth !== y.grid.depth || x.grid.depth !== z.grid.depth) {
      throw new Error("VectorField3 component grid mismatch.");
    }
  }

  public get grid(): IUniformGrid3 {
    return this.x.grid;
  }
}
