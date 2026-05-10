import type { MxGraphShape } from "../domain/MxGraphShape.js";
import type { SvgShape } from "../domain/SvgShape.js";

export interface ISvgShapeConverter {
  convert(shape: MxGraphShape, rootName?: string): SvgShape;
}