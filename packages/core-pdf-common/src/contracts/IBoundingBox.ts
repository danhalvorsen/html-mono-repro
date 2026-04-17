import { IPosition } from "./IPosition.js";

export interface IInterval {
    readonly min: number;
    readonly max: number;
}

export interface IBoundingBox {
  readonly id: string;

  readonly min: IPosition;
  readonly max: IPosition;

  readonly width: number;
  readonly height: number;
}