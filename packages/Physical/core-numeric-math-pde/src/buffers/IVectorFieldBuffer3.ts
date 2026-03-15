import { IReadOnlyVectorField3 } from "../fields/IReadOnlyVectorField3.js";
import { IVectorField3 } from "../fields/IVectorField3.js";


export interface IVectorFieldBuffer3 {
  clone(source: IReadOnlyVectorField3): IVectorField3;
  copy(source: IReadOnlyVectorField3, target: IVectorField3): void;
}
