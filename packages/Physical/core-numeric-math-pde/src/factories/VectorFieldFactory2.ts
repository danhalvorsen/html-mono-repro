import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";
import { IVectorFieldFactory2 } from "./IVectorFieldFactory2.js";
import { IScalarFieldFactory2 } from "./IScalarFieldFactory2.js";
import { VectorField2 } from "../fields/VectorField2.js";

export class VectorFieldFactory2 implements IVectorFieldFactory2 {
  public constructor(
    private readonly scalarFieldFactory: IScalarFieldFactory2
  ) { }

  public create(grid: IUniformGrid2): IVectorField2 {
    return new VectorField2(
      this.scalarFieldFactory.create(grid),
      this.scalarFieldFactory.create(grid)
    );
  }
}
