import { IPosition } from "./IPosition.js";

export interface IBoundingBox {
  readonly id: string;

  readonly min: IPosition;
  readonly max: IPosition;

  readonly width: number;
  readonly height: number;
}