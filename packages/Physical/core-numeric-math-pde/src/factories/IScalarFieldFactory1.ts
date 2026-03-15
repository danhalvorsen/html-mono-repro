import { IUniformGrid1 } from "../grid/IUniformGrid1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";

// ============================================================
// FACTORY / BUFFER CONTRACTS
// ============================================================

export interface IScalarFieldFactory1 {
  create(grid: IUniformGrid1): IScalarField1;
}
