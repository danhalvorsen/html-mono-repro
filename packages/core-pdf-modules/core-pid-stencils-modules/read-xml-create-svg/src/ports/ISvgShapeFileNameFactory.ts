import type { SvgShape } from "../domain/SvgShape.js";

export interface ISvgShapeFileNameFactory {
  create(shape: SvgShape): string;
}