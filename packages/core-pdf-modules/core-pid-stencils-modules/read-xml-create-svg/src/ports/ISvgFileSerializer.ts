import type { SvgShape } from "../domain/SvgShape.js";

export interface ISvgFileSerializer {
  serialize(shape: SvgShape): string;
}