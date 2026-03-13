import { IReadOnlyVectorField2 } from "../fields/IReadOnlyVectorField2.js";
import { IVectorField2 } from "../fields/IVectorField2.js";


export interface IVectorFieldBuffer2 {
  clone(source: IReadOnlyVectorField2): IVectorField2;
  copy(source: IReadOnlyVectorField2, target: IVectorField2): void;
}
