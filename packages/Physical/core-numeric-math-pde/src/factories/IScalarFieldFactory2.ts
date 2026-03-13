import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IScalarField2 } from "../fields/IScalarField2.js";


export interface IScalarFieldFactory2 {
  create(grid: IUniformGrid2): IScalarField2;
}
