import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";
import { IScalarFieldFactory2 } from "./IScalarFieldFactory2.js";
import { ScalarField2 } from "../fields/ScalarField2.js";


export class ScalarFieldFactory2 implements IScalarFieldFactory2 {
  public create(grid: IUniformGrid2): IScalarField2 {
    return new ScalarField2(grid);
  }
}
