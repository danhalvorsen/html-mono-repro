import { IUniformGrid3 } from "../grid/IUniformGrid3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";

export interface IVectorFieldFactory3 {
  create(grid: IUniformGrid3): IVectorField3;
}
