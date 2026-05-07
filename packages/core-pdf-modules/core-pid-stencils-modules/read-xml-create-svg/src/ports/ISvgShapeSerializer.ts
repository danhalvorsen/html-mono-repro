import type { SvgShapeDocument } from "../domain/SvgShape.js";

export interface ISvgShapeSerializer {
  serialize(document: SvgShapeDocument): string;
}