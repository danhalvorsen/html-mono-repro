import { IPoint2D } from "./IPoint2D.js";
import { ISemanticAddress } from "./ISemanticAddress.js";

export interface ISemanticEdgePoint<TPointAddress extends ISemanticAddress = ISemanticAddress> {
  readonly address: TPointAddress;
  readonly t: number; // normalized position on edge: 0..1
  readonly position: IPoint2D;
}
