import { IUniformGrid2 } from "../grid/IUniformGrid2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";


export interface IVectorFieldFactory2 {
  create(grid: IUniformGrid2): IVectorField2;
}
