
import type { IColor } from "./IColor.js";

export interface IPalette {
  readonly count: number;

  getAt(index: number): IColor;
  getAll(): readonly IColor[];
}