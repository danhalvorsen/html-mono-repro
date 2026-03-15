import { IUniformGrid1 } from "../grid/IUniformGrid1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";
import { IScalarFieldFactory1 } from "./IScalarFieldFactory1.js";
import { ScalarField1 } from "../fields/ScalarField1.js";

// ============================================================
// FACTORY / BUFFER IMPLEMENTATIONS
// ============================================================

export class ScalarFieldFactory1 implements IScalarFieldFactory1 {
  public create(grid: IUniformGrid1): IScalarField1 {
    return new ScalarField1(grid);
  }
}
