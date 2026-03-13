import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IScalarField3 } from "../fields/IScalarField3.js";


export interface IScalarFieldFactory3 {
  create(grid: IUniformGrid3): IScalarField3;
}
