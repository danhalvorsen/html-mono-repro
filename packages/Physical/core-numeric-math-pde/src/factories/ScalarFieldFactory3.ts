import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";
import { IScalarFieldFactory3 } from "./IScalarFieldFactory3.js";
import { ScalarField3 } from "../fields/ScalarField3.js";

export class ScalarFieldFactory3 implements IScalarFieldFactory3 {
  public create(grid: IUniformGrid3): IScalarField3 {
    return new ScalarField3(grid);
  }
}
