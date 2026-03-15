import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";
import { IVectorFieldFactory3 } from "./IVectorFieldFactory3.js";
import { IScalarFieldFactory3 } from "./IScalarFieldFactory3.js";
import { VectorField3 } from "../fields/VectorField3.js";

export class VectorFieldFactory3 implements IVectorFieldFactory3 {
  public constructor(
    private readonly scalarFieldFactory: IScalarFieldFactory3
  ) { }

  public create(grid: IUniformGrid3): IVectorField3 {
    return new VectorField3(
      this.scalarFieldFactory.create(grid),
      this.scalarFieldFactory.create(grid),
      this.scalarFieldFactory.create(grid)
    );
  }
}
